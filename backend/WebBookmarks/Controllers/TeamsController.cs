using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebBookmarks.Data;
using WebBookmarks.DTO;
using WebBookmarks.Models;

namespace WebBookmarks.Controllers
{
    [Route("api/teams")]
    [ApiController]
    public class TeamsController : ControllerBase
    {
        private readonly BookmarksDBContext _dbcontext;
        public TeamsController(BookmarksDBContext dbcontext)
        {
            _dbcontext = dbcontext;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<Team>>> Get([FromQuery] Guid? userId)
        {
            Guid loggedInUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            IQueryable<Team> teamsQueryable = _dbcontext.Teams.Include(t => t.Members).AsQueryable();

            if(userId is not null)
            {
                if(userId != loggedInUserId)
                {
                    return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content");
                }
                User? user = await _dbcontext.Users.FindAsync(userId);
                if(user is null) { return BadRequest("Non-Existant User"); }
                teamsQueryable = teamsQueryable.Where(t => t.Members.Contains(user));
            }
            List<TeamInfoDTO> teams = await teamsQueryable.Select(t => new TeamInfoDTO { Id = t.Id, Title = t.Title }).ToListAsync();
            return Ok(teams);
        }

        [HttpGet("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<object>> GetById(Guid id)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User user = (await _dbcontext.Users.FindAsync(userId))!;
            var team = await _dbcontext.Teams
                .Include(t => t.Members)
                .Include(t => t.Bookmarks)
                .FirstOrDefaultAsync(t => t.Id == id);

            if (team is null)
                return NotFound();

            if (!team.Members.Contains(user))
            {
                return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content");
            }
            var result = new
            {
                team.Id,
                team.Title,
                team.OwnerID,
                Members = team.Members.Select(u => new
                {
                    u.Id,
                    u.Username
                }),
                Bookmarks = team.Bookmarks.Select(b => new
                {
                    b.Id,
                    b.Title,
                    b.Link,
                    b.BaseSite,
                    b.Folders,
                    b.Archived,
                    b.DateAdded,
                    b.IconURL,
                    b.MediaType
                })
            };

            return Ok(result);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<List<Team>>> Post(TeamDTO teamDTO)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User user = (await _dbcontext.Users.FindAsync(userId))!;
            Team team = new Team
            {
                Title = teamDTO.Title,
                OwnerID = userId,
                Owner = user,
            };
            team.Members.Add(user);
            user.Teams.Add(team);
            await _dbcontext.Teams.AddAsync(team);
            await _dbcontext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { team.Id }, team);
        }

        [HttpPost("{id:guid}/members")]
        [Authorize]
        public async Task<IActionResult> JoinTeam(Guid id)
        {
            Team? team = await _dbcontext.Teams
                .Include(t => t.Members)
                .FirstOrDefaultAsync(t => t.Id == id);
            if (team is null) { return NotFound(); }
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User user = (await _dbcontext.Users.FindAsync(userId))!;
            if (!team.Members.Any(m => m.Id == userId))
            {
                team.Members.Add(user);
            }
            await _dbcontext.SaveChangesAsync();

            return NoContent();
        }

        [HttpPatch("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<Folder>> ChangeTitle(Guid id, [FromBody] NameDTO teamDTO)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            Team? team = await _dbcontext.Teams.FindAsync(id);
            if (team is null) { return NotFound(); }
            if (team.OwnerID != userId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot modify this content"); }

            team.Title = teamDTO.Title;
            TeamInfoDTO teamInfo = new() { Id = team.Id, Title = team.Title };
            await _dbcontext.SaveChangesAsync();

            return Ok(teamInfo);
        }

        [HttpDelete("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            Team? team = await _dbcontext.Teams
                .Include(t => t.Members).Include(t => t.Bookmarks)
                .FirstOrDefaultAsync(t => t.Id == id);
            if (team is null) { return NotFound(); }
            if(team.OwnerID != userId)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "You cannot delete this content");
            }
            team.Members.Clear();
            team.Bookmarks.Clear();
            _dbcontext.Teams.Remove(team);
            await _dbcontext.SaveChangesAsync();

            return NoContent();
        }

        [HttpDelete("{id:guid}/members")]
        [Authorize]
        public async Task<IActionResult> KickMember(Guid id, [FromBody] MemberDTO memberDTO)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            Team? team = await _dbcontext.Teams
                .Include(t => t.Members).FirstOrDefaultAsync(t => t.Id == id);
            if(team is null) { return NotFound(); }

            User? targetUser = await _dbcontext.Users.FindAsync(memberDTO.UserId);
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
            await _dbcontext.SaveChangesAsync();

            return NoContent();
        }
    }
}
