using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using System.Security.Claims;
using WebBookmarks.Data;
using WebBookmarks.DTO;
using WebBookmarks.Models;

namespace WebBookmarks.Controllers
{
    [Route("api/private")]
    [ApiController]
    public class PrivateBookmarksController : ControllerBase
    {
        private readonly BookmarksDBContext _dbContext;
        public PrivateBookmarksController(BookmarksDBContext dbcontext) {
            _dbContext = dbcontext;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<PrivateBookmarkInfoDTO>>> GetAll()
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            IQueryable<PrivateBookmark> bookmarksQueryable = _dbContext.PrivateBookmarks.Where(p => p.AuthorId == userId).AsQueryable();
            List<PrivateBookmarkInfoDTO> bookmarks = await bookmarksQueryable.Select(b => new PrivateBookmarkInfoDTO
            {
                Id = b.Id,
                Cipher = b.Cipher,
                Iv = b.Iv,
                DateAdded = b.DateAdded
            }).ToListAsync();
            return Ok(bookmarks);
        }

        [HttpGet("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<PrivateBookmarkInfoDTO>> GetById(Guid id)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            PrivateBookmark? bookmark = await _dbContext.PrivateBookmarks.FindAsync(id);
            if(bookmark is null) { return NotFound(); }
            PrivateBookmarkInfoDTO bookmarkInfo = new()
            {
                Id = bookmark.Id,
                Cipher = bookmark.Cipher,
                Iv = bookmark.Iv,
                DateAdded = bookmark.DateAdded
            };
            return Ok(bookmarkInfo);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<PrivateBookmarkInfoDTO>> Post(PrivateBookmarkDTO bookmarkDTO)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User user = (await _dbContext.Users.FindAsync(userId))!;

            PrivateBookmark bookmark = new PrivateBookmark
            {
                Author = user,
                AuthorId = userId,
                Cipher = bookmarkDTO.Cipher,
                Iv = bookmarkDTO.Iv,
                DateAdded = DateTime.UtcNow
            };

            await _dbContext.PrivateBookmarks.AddAsync(bookmark);
            await _dbContext.SaveChangesAsync();
            PrivateBookmarkInfoDTO bookmarkInfo = new()
            {
                Id = bookmark.Id,
                Cipher = bookmark.Cipher,
                Iv = bookmark.Iv,
                DateAdded = bookmark.DateAdded
            };
            return CreatedAtAction(nameof(GetById), new { bookmark.Id }, bookmarkInfo);
        }

        [HttpPut("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<PrivateBookmarkInfoDTO>> Put(Guid id, [FromBody] PrivateBookmarkDTO bookmarkDTO)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            PrivateBookmark? bookmark = await _dbContext.PrivateBookmarks.FindAsync(id);
            if(bookmark is null) { return NotFound(); }
            if(bookmark.AuthorId != userId) { return Forbid(); }
            bookmark.Cipher = bookmarkDTO.Cipher;
            bookmark.Iv = bookmarkDTO.Iv;

            await _dbContext.SaveChangesAsync();

            PrivateBookmarkInfoDTO bookmarkInfo = new()
            {
                Id = bookmark.Id,
                Cipher = bookmark.Cipher,
                Iv = bookmark.Iv,
                DateAdded = bookmark.DateAdded
            };
            return Ok(bookmarkInfo);
        }

        [HttpDelete("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            PrivateBookmark? bookmark = await _dbContext.PrivateBookmarks.FindAsync(id);
            if (bookmark is null) { return NotFound(); }
            if (bookmark.AuthorId != userId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content"); }

            _dbContext.PrivateBookmarks.Remove(bookmark);
            await _dbContext.SaveChangesAsync();
            return NoContent();
        }
    }
}
