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
    [Route("api/bookmarks")]
    [ApiController]
    public class BookmarksController : ControllerBase
    {
        private readonly BookmarksDBContext _dbcontext;
        public BookmarksController(BookmarksDBContext dbcontext)
        {
            _dbcontext = dbcontext;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<Bookmark>>> Get([FromQuery] Guid? userId, [FromQuery] bool archived = false)
        {
            IQueryable<Bookmark> bookmarksQueryable = _dbcontext.Bookmarks.AsQueryable();
            List<Bookmark> bookmarks;
            if(userId is not null)
            {
                Guid loggedInUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
                User? user = await _dbcontext.Users.FindAsync(userId);
                if(user is null) { return BadRequest("Non-existant UserId"); }
                if(loggedInUserId == userId)
                {
                    bookmarksQueryable = bookmarksQueryable.Where(b => b.AuthorID == userId);
                } else
                {
                    return Forbid("You cannot access this content");
                }
            }
            if(archived)
            {
                bookmarksQueryable = bookmarksQueryable.Where(b => b.Archived == true);
            } else
            {
                bookmarksQueryable = bookmarksQueryable.Where(b => b.Archived == false);
            }
                bookmarks = await bookmarksQueryable.ToListAsync();
            return Ok(bookmarks);
        }

        [HttpGet("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<Bookmark>> GetById(Guid id)
        {
            Bookmark? bookmark = await _dbcontext.Bookmarks.FindAsync(id);
            Guid loggedInUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            if(loggedInUserId != bookmark.AuthorID)
            {
                return Forbid("You cannot access this content");
            }
            if (bookmark is null) { return  NotFound(); }

            return Ok(bookmark);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Bookmark>> Post([FromBody] BookmarkDTO bookmarkDTO)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User? user = await _dbcontext.Users.FindAsync(userId);
            if (user is null) { return BadRequest(); }

            Bookmark bookmark = new Bookmark
            {
                IconURL = bookmarkDTO.IconURL,
                Title = bookmarkDTO.Title,
                BaseSite = bookmarkDTO.BaseSite,
                Link = bookmarkDTO.Link,
                MediaType = bookmarkDTO.MediaType,
                Archived = false,
                AuthorID = userId,
                Author = user,
                DateAdded = DateTime.UtcNow
            };

            await _dbcontext.Bookmarks.AddAsync(bookmark);
            await _dbcontext.SaveChangesAsync();

            return CreatedAtAction(nameof(GetById), new { bookmark.Id }, bookmark);
        }

        [HttpPatch("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<Bookmark>> Patch(Guid id, [FromBody] BookmarkPatchDTO patchDTO)
        {
            Bookmark? bookmark = await _dbcontext.Bookmarks.FindAsync(id);
            Guid loggedInUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            if(loggedInUserId != bookmark.AuthorID)
            {
                return Forbid("You cannot access this content");
            }
            if (bookmark is null) { return NotFound(); }

            if(patchDTO.IconURL is not null) { bookmark.IconURL = patchDTO.IconURL; }
            if(patchDTO.Link is not null) { bookmark.Link = patchDTO.Link; }
            if(patchDTO.BaseSite is not null) { bookmark.BaseSite = patchDTO.BaseSite; }
            if(patchDTO.Title is not null) { bookmark.Title = patchDTO.Title; }
            if(patchDTO.MediaType is not null) { bookmark.MediaType = patchDTO.MediaType; }
            if(patchDTO.Archived is not null) { bookmark.Archived = patchDTO.Archived ?? false;  }

            await _dbcontext.SaveChangesAsync();
            return Ok(bookmark);
        }
    }
}
