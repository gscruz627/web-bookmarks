using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Npgsql;
using System.Security.Claims;
using WebBookmarks.Data;
using WebBookmarks.DTO;
using WebBookmarks.Models;

namespace WebBookmarks.Controllers
{
    [Route("api/teams")]
    [ApiController]
    public class TeamsController(BookmarksDBContext dbcontext) : ControllerBase
    {
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<Team>>> Get([FromQuery] Guid? userId)
        {
            Guid loggedInUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            IQueryable<Team> teamsQueryable = dbcontext.Teams.Include(t => t.Members).AsQueryable();

            if(userId is not null)
            {
                if(userId != loggedInUserId)
                {
                    return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content");
                }
                User? user = await dbcontext.Users.FindAsync(userId);
                if(user is null) { return BadRequest("Non-Existant User"); }
                teamsQueryable = teamsQueryable.Where(t => t.Members.Contains(user));
            }
            List<TeamInfoDTO> teams = await teamsQueryable.Select(t => new TeamInfoDTO { Id = t.Id, Title = t.Title }).ToListAsync();
            return Ok(teams);
        }

        [HttpGet("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<TeamContentsDTO>> GetById(Guid id)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User user = (await dbcontext.Users.FindAsync(userId))!;
            var team = await dbcontext.Teams
                .Include(t => t.Members)
                .Include(t => t.Bookmarks)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (team is null)
                return NotFound();

            if (!team.Members.Contains(user))
            {
                return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content");
            }

            TeamContentsDTO teamInfo = new()
            {
                Id = team.Id,
                Title = team.Title,
                OwnerID = team.OwnerID,
                Members = team.Members.Select(u => new UserInfoDTO
                {
                    UserId = u.Id,
                    Username = u.Username
                }).ToList(),
                Bookmarks = team.Bookmarks.Select(b => new BookmarkInfoDTO
                {
                    Id = b.Id,
                    Title = b.Title,
                    Link = b.Link,
                    BaseSite = b.BaseSite,
                    Folders = b.Folders.Select(f => new FolderInfoDTO { Id =f.Id, Title = f.Title}).ToList(),
                    Archived = b.Archived,
                    DateAdded = b.DateAdded,
                    IconURL = b.IconURL,
                    MediaType = b.MediaType
                }).ToList()
            };
            return Ok(teamInfo);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<TeamInfoDTO>> Post(TeamDTO teamDTO)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User user = (await dbcontext.Users.FindAsync(userId))!;
            Team team = new Team
            {
                Title = teamDTO.Title,
                OwnerID = userId,
                Owner = user,
            };
            team.Members.Add(user);
            user.Teams.Add(team);
            await dbcontext.Teams.AddAsync(team);
            await dbcontext.SaveChangesAsync();

            TeamInfoDTO infoDTO = new() { Id = team.Id, Title = team.Title };
            return CreatedAtAction(nameof(GetById), new { team.Id }, infoDTO);
        }

        [HttpPost("{id:guid}/members")]
        [Authorize]
        public async Task<IActionResult> JoinTeam(Guid id)
        {
            Team? team = await dbcontext.Teams
                .Include(t => t.Members)
                .FirstOrDefaultAsync(t => t.Id == id);
            if (team is null) { return NotFound(); }
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User user = (await dbcontext.Users.FindAsync(userId))!;
            bool alreadyMember = await dbcontext.Teams
                .Where(t => t.Id == id)
                .SelectMany(t => t.Members)
                .AnyAsync(m => m.Id == userId);

            if (!alreadyMember)
            {
                team.Members.Add(user);
                user.Teams.Add(team);
            }
            try
            {
                await dbcontext.SaveChangesAsync();
            }
            catch (DbUpdateException ex) when (ex.InnerException is PostgresException pgEx && pgEx.SqlState == "23505")
            {
                /* I could not find the source of this issue in some cases, whether the user is already on this 
                 team oor not, a PK duplicate error is thrown, the join table may correctly add a new record
                 or not, depending on the actual chhecking mechanism above, but regardless, sometimes this error is
                 thrown, so if this is the issue, ignore.
                */
            }

            return NoContent();
        }

        [HttpPatch("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<Folder>> ChangeTitle(Guid id, [FromBody] NameDTO teamDTO)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            Team? team = await dbcontext.Teams.FindAsync(id);
            if (team is null) { return NotFound(); }
            if (team.OwnerID != userId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot modify this content"); }

            team.Title = teamDTO.Title;
            await dbcontext.SaveChangesAsync();
            TeamInfoDTO teamInfo = new() { Id = team.Id, Title = team.Title };
            return Ok(teamInfo);
        }

        [HttpDelete("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            Team? team = await dbcontext.Teams
                .Include(t => t.Members).Include(t => t.Bookmarks)
                .FirstOrDefaultAsync(t => t.Id == id);
            if (team is null) { return NotFound(); }
            if(team.OwnerID != userId)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "You cannot delete this content");
            }
            team.Members.Clear();
            team.Bookmarks.Clear();
            dbcontext.Teams.Remove(team);
            await dbcontext.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id:guid}/members")]
        [Authorize]
        public async Task<IActionResult> KickMember(Guid id, [FromBody] MemberDTO memberDTO)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            Team? team = await dbcontext.Teams
                .Include(t => t.Members).FirstOrDefaultAsync(t => t.Id == id);
            if(team is null) { return NotFound(); }

            User? targetUser = await dbcontext.Users.FindAsync(memberDTO.UserId);
            if(targetUser is null) { return BadRequest("User does not exist"); }

            if(!(userId == targetUser.Id)) 
            {
                // The user is trying to remove another user. Confirm permissions.
                if (team.OwnerID != userId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot modify delete this user, escalate"); }
                if (targetUser.Id == team.OwnerID) { return BadRequest("Owner cannot be removed"); }
            }
            
            // User is removing himself or has valid permissions to remove others.
            if (!team.Members.Contains(targetUser))
            {
                return BadRequest("User is not a member of this group.");
            }
            targetUser.Teams.Remove(team);
            team.Members.Remove(targetUser);
            await dbcontext.SaveChangesAsync();

            return NoContent();
        }
    }
}
