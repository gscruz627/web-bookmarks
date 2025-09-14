using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebBookmarks.Data;
using WebBookmarks.DTO;
using WebBookmarks.Models;

namespace WebBookmarks.Controllers
{
    [Route("api/bookmarks")]
    [ApiController]
    public class BookmarksController(BookmarksDBContext dbcontext) : ControllerBase
    {
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<BookmarkInfoDTO>>> Get([FromQuery] Guid? userId, [FromQuery] bool archived = false)
        {
            IQueryable<Bookmark> bookmarksQueryable = dbcontext.Bookmarks.Include(b => b.Folders).AsQueryable();
            if(userId is not null)
            {
                Guid loggedInUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                User? user = await dbcontext.Users.FindAsync(userId);
                if(user is null) { return BadRequest("Non-existant UserId"); }
                if(loggedInUserId == userId)
                {
                    bookmarksQueryable = bookmarksQueryable.Where(b => b.AuthorID == userId);
                } else
                {
                    return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content");
                }
            }
            if(archived)
            {
                bookmarksQueryable = bookmarksQueryable.Where(b => b.Archived == true);
            } else
            {
                bookmarksQueryable = bookmarksQueryable.Where(b => b.Archived == false);
            }
            List<BookmarkInfoDTO> bookmarks = await bookmarksQueryable.Select(b => new BookmarkInfoDTO
            {
                Archived = b.Archived,
                Id = b.Id,
                Title = b.Title,
                MediaType = b.MediaType,
                Link = b.Link,
                IconURL = b.IconURL,
                BaseSite = b.BaseSite,
                DateAdded = b.DateAdded,
                Folders = b.Folders.Select( f => new FolderInfoDTO { Id = f.Id, Title = f.Title}).ToList()
            }).ToListAsync();
            return Ok(bookmarks);
        }

        [HttpGet("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<BookmarkInfoDTO>> GetById(Guid id)
        {
            Bookmark? bookmark = await dbcontext.Bookmarks.FindAsync(id);
            if (bookmark is null) { return NotFound(); }
            Guid loggedInUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            if(loggedInUserId != bookmark.AuthorID)
            {
                return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content");
            }

            BookmarkInfoDTO infoDTO = new()
            {
                Archived = bookmark.Archived,
                Id = bookmark.Id,
                Title = bookmark.Title,
                MediaType = bookmark.MediaType,
                Link = bookmark.Link,
                IconURL = bookmark.IconURL,
                BaseSite = bookmark.BaseSite,
                DateAdded = bookmark.DateAdded,
                Folders = bookmark.Folders.Select(f => new FolderInfoDTO { Id = f.Id, Title = f.Title }).ToList()
            };

            return Ok(infoDTO);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<BookmarkInfoDTO>> Post([FromBody] BookmarkDTO bookmarkDTO)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User? user = await dbcontext.Users.FindAsync(userId);
            if (user is null) { return BadRequest(); }

            Bookmark bookmark = new()
            {
                IconURL = bookmarkDTO.IconURL,
                Title = bookmarkDTO.Title,
                BaseSite = bookmarkDTO.BaseSite,
                Link = bookmarkDTO.Link,
                MediaType = bookmarkDTO.MediaType,
                Archived = false,
                DateAdded = DateTime.UtcNow
            };
            if(bookmarkDTO.TeamId is null)
            {
                bookmark.AuthorID = userId;
                bookmark.Author = user;
            } else
            {
                Team? team = await dbcontext.Teams.Include(t => t.Members).FirstOrDefaultAsync( t => t.Id == bookmarkDTO.TeamId);
                if(team is null) { return BadRequest("Team does not exist"); }
                if (!(team.Members.Contains(user))) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot modify this content"); }
                bookmark.TeamID = bookmarkDTO.TeamId;
                bookmark.Team = team;
            }

            await dbcontext.Bookmarks.AddAsync(bookmark);
            await dbcontext.SaveChangesAsync();

            BookmarkInfoDTO infoDTO = new()
            {
                Archived = bookmark.Archived,
                Id = bookmark.Id,
                Title = bookmark.Title,
                MediaType = bookmark.MediaType,
                Link = bookmark.Link,
                IconURL = bookmark.IconURL,
                BaseSite = bookmark.BaseSite,
                DateAdded = bookmark.DateAdded,
                Folders = bookmark.Folders.Select(f => new FolderInfoDTO { Id = f.Id, Title = f.Title }).ToList()
            };
            return CreatedAtAction(nameof(GetById), new { bookmark.Id }, infoDTO);
        }

        [HttpPatch("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<BookmarkInfoDTO>> Patch(Guid id, [FromBody] BookmarkPatchDTO patchDTO)
        {
            Bookmark? bookmark = await dbcontext.Bookmarks.FindAsync(id);
            if(bookmark is null) { return NotFound(); }
            Guid loggedInUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            if (bookmark is null) { return NotFound(); }

            if (bookmark.AuthorID is not null)
            {
                if (loggedInUserId != bookmark.AuthorID)
                {
                    return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content");
                }
            }
            
            if(bookmark.Team is not null)
            {
                if(bookmark.Team.OwnerID != loggedInUserId)
                {
                    return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content");
                }
            }
            
            if(patchDTO.IconURL is not null) { bookmark.IconURL = patchDTO.IconURL; }
            if(patchDTO.Link is not null) { bookmark.Link = patchDTO.Link; }
            if(patchDTO.BaseSite is not null) { bookmark.BaseSite = patchDTO.BaseSite; }
            if(patchDTO.Title is not null) { bookmark.Title = patchDTO.Title; }
            if(patchDTO.MediaType is not null) { bookmark.MediaType = patchDTO.MediaType; }
            if(patchDTO.Archived is not null) { 
                bookmark.Archived = patchDTO.Archived ?? false;  
            }

            await dbcontext.SaveChangesAsync();
            BookmarkInfoDTO infoDTO = new()
            {
                Archived = bookmark.Archived,
                Id = bookmark.Id,
                Title = bookmark.Title,
                MediaType = bookmark.MediaType,
                Link = bookmark.Link,
                IconURL = bookmark.IconURL,
                BaseSite = bookmark.BaseSite,
                DateAdded = bookmark.DateAdded,
                Folders = bookmark.Folders.Select(f => new FolderInfoDTO { Id = f.Id, Title = f.Title }).ToList()
            };
            return Ok(infoDTO);
        }

        [HttpDelete("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            Bookmark? bookmark = await dbcontext.Bookmarks.Include(b => b.Folders).FirstOrDefaultAsync(b => b.Id == id);

            if (bookmark is null) { return NotFound(); }
            if (bookmark.AuthorID is not null)
            {
                if (bookmark.AuthorID != userId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content"); }
            }
            if(bookmark.Team is not null)
            {
                if(bookmark.Team.OwnerID != userId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content."); }
            }
            bookmark.Folders.Clear();
            dbcontext.Bookmarks.Remove(bookmark);
            await dbcontext.SaveChangesAsync();

            return NoContent();
        }
    }
}
