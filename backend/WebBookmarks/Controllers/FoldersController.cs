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
    [Route("api/folders")]
    [ApiController]
    public class FoldersController : ControllerBase
    {
        private readonly BookmarksDBContext _dbcontext;
        public FoldersController(BookmarksDBContext dbcontext)
        {
            _dbcontext = dbcontext;
        }

        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<Folder>>> Get([FromQuery] Guid? userId)
        {
            Guid loggedInUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            IQueryable<Folder> foldersQueryable = _dbcontext.Folders.AsQueryable();

            if(userId is not null)
            {
                User? user = await _dbcontext.Users.FindAsync(userId);
                if(user is null) { return BadRequest("Non-Existant User ID"); }

                foldersQueryable = foldersQueryable.Where(f => f.OwnerID == userId);
            }

            List<Folder> folders = await foldersQueryable.ToListAsync();
            return Ok(folders);
        }

        [HttpGet("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<Folder>> GetById(Guid id)
        {
            Guid loggedInUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            Folder? folder = await _dbcontext.Folders.Include(f => f.Bookmarks).FirstOrDefaultAsync(f => f.Id == id);
            
            if(folder is null) { return NotFound(); }
            if(folder.OwnerID != loggedInUserId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content"); }

            return Ok(folder);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<Folder>> Post([FromBody] FolderDTO folderDTO)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User user = (await _dbcontext.Users.FindAsync(userId))!;

            Folder folder = new Folder
            {
                Title = folderDTO.Title,
                OwnerID = userId,
                Owner = user
            };

            await _dbcontext.Folders.AddAsync(folder);
            await _dbcontext.SaveChangesAsync();

            return CreatedAtAction(nameof(Get), new { folder.Id }, folder);
        }

        [HttpPatch("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<Folder>> ChangeTitle(Guid id,[FromBody] NameDTO folderDTO)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            Folder? folder = await _dbcontext.Folders.FindAsync(id);
            if(folder is null) { return NotFound(); }
            if(folder.OwnerID != userId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot modify this content"); }

            folder.Title = folderDTO.Title;
            await _dbcontext.SaveChangesAsync();

            return Ok(folder);
        } 

        [HttpPost("{id:guid}/bookmarks")]
        [Authorize]
        public async Task<ActionResult<Folder>> AddBookmarkToFolder(Guid Id, [FromBody] BookmarkToFolderDTO contentDTO)
        {
            Guid parsedBookmarkIid = Guid.Parse(contentDTO.BookmarkID);
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            Folder? folder = await _dbcontext.Folders.FindAsync(Id);
            if(folder is null) { return NotFound(); }

            if(folder.OwnerID != userId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content"); }

            Bookmark? bookmark = await _dbcontext.Bookmarks.FindAsync(parsedBookmarkIid);
            if(bookmark is null) { return NotFound(); }
            if(bookmark.AuthorID != userId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content"); }

            folder.Bookmarks.Add(bookmark);
            await _dbcontext.SaveChangesAsync();

            return Ok(folder);
        }

        [HttpDelete("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            Folder? folder = await _dbcontext.Folders.Include(f => f.Bookmarks).FirstOrDefaultAsync(f => f.Id == id);
            if(folder is null) { return NotFound(); }
            if(folder.OwnerID != userId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot modify this content."); }

            folder.Bookmarks.Clear();
            _dbcontext.Folders.Remove(folder);
            await _dbcontext.SaveChangesAsync();
            return NoContent();
        }
    }
}
