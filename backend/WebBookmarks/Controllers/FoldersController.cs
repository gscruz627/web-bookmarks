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
    public class FoldersController(BookmarksDBContext dbcontext) : ControllerBase
    {
        [HttpGet]
        [Authorize]
        public async Task<ActionResult<List<FolderInfoDTO>>> Get([FromQuery] Guid? userId)
        {
            Guid loggedInUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            IQueryable<Folder> foldersQueryable = dbcontext.Folders.AsQueryable();

            if (userId is not null)
            {
                User? user = await dbcontext.Users.FindAsync(userId);
                if (user is null) { return BadRequest("Non-Existant User ID"); }

                foldersQueryable = foldersQueryable.Where(f => f.OwnerID == userId);
            }

            List<FolderInfoDTO> folders = await foldersQueryable.Select(f => new FolderInfoDTO
            {
                Id = f.Id,
                Title = f.Title
            }).ToListAsync();
            return Ok(folders);
        }

        [HttpGet("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<FolderContentDTO>> GetById(Guid id)
        {
            Guid loggedInUserId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            Folder? folder = await dbcontext.Folders.Include(f => f.Bookmarks.Where(b => !b.Archived)).FirstOrDefaultAsync(f => f.Id == id);

            if (folder is null) { return NotFound(); }
            if (folder.OwnerID != loggedInUserId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content"); }
            FolderContentDTO folderContent = new()
            {
                Id = folder.Id,
                Title = folder.Title,
                Bookmarks = folder.Bookmarks
            };
            return Ok(folderContent);
        }

        [HttpPost]
        [Authorize]
        public async Task<ActionResult<FolderInfoDTO>> Post([FromBody] FolderDTO folderDTO)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            User user = (await dbcontext.Users.FindAsync(userId))!;

            Folder folder = new Folder
            {
                Title = folderDTO.Title,
                OwnerID = userId,
                Owner = user
            };

            await dbcontext.Folders.AddAsync(folder);
            await dbcontext.SaveChangesAsync();

            FolderInfoDTO infoDTO = new()
            {
                Id = folder.Id,
                Title = folder.Title
            };

            return CreatedAtAction(nameof(Get), new { folder.Id }, infoDTO);
        }

        [HttpPatch("{id:guid}")]
        [Authorize]
        public async Task<ActionResult<FolderInfoDTO>> ChangeTitle(Guid id, [FromBody] NameDTO folderDTO)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            Folder? folder = await dbcontext.Folders.FindAsync(id);
            if (folder is null) { return NotFound(); }
            if (folder.OwnerID != userId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot modify this content"); }

            folder.Title = folderDTO.Title;

            await dbcontext.SaveChangesAsync();


            FolderInfoDTO infoDTO = new()
            {
                Id = folder.Id,
                Title = folder.Title
            };

            return Ok(infoDTO);
        }

        [HttpPost("{id:guid}/bookmarks")]
        [Authorize]
        public async Task<ActionResult<BookmarkInfoDTO>> AddBookmarkToFolder(Guid Id, [FromBody] BookmarkToFolderDTO contentDTO)
        {
            Guid parsedBookmarkIid = Guid.Parse(contentDTO.BookmarkID);
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            Folder? folder = await dbcontext.Folders.FindAsync(Id);
            if (folder is null) { return NotFound(); }

            if (folder.OwnerID != userId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content"); }

            Bookmark? bookmark = await dbcontext.Bookmarks.FindAsync(parsedBookmarkIid);
            if (bookmark is null) { return NotFound(); }
            if (bookmark.AuthorID != userId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content"); }

            // Double check that this folder does not already have this bookmark in list, if so, ignore, return the same bookmark.
            if (!folder.Bookmarks.Contains(bookmark))
            {
                folder.Bookmarks.Add(bookmark);
                bookmark.Folders.Add(folder);
            }


            await dbcontext.SaveChangesAsync();

            BookmarkInfoDTO bookmarkDTO = new()
            {
                Archived = bookmark.Archived,
                BaseSite = bookmark.BaseSite,
                DateAdded = bookmark.DateAdded,
                IconURL = bookmark.IconURL,
                Id = bookmark.Id,
                Link = bookmark.Link,
                MediaType = bookmark.MediaType,
                Title = bookmark.Title,
                Folders = bookmark.Folders.Select(f => new FolderInfoDTO { Id = f.Id, Title = f.Title }).ToList()
            };

            return Ok(bookmarkDTO);
        }

        [HttpDelete("{id:guid}/bookmarks")]
        [Authorize]
        public async Task<ActionResult<FolderContentDTO>> RemoveBookmarkFromFolder(Guid id, [FromBody] BookmarkToFolderDTO contentDTO)
        {
            Guid parsedBookmarkIid = Guid.Parse(contentDTO.BookmarkID);
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);

            Folder? folder = await dbcontext.Folders.Include(f => f.Bookmarks).FirstOrDefaultAsync(f => f.Id == id);
            if (folder is null) { return NotFound(); }
            if (folder.OwnerID != userId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content"); }

            Bookmark? bookmark = await dbcontext.Bookmarks.FindAsync(parsedBookmarkIid);
            if (bookmark is null) { return NotFound(); }
            if (bookmark.AuthorID != userId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot access this content"); }

            if (!folder.Bookmarks.Contains(bookmark))
            {
                return BadRequest("Folder does not contain this bookmark.");
            }
            folder.Bookmarks.Remove(bookmark);
            bookmark.Folders.Remove(folder);

            await dbcontext.SaveChangesAsync();

            FolderContentDTO folderDTO = new()
            {
                Id = folder.Id,
                Title = folder.Title,
                Bookmarks = folder.Bookmarks
            };
            return Ok(folderDTO);
        }

        [HttpDelete("{id:guid}")]
        [Authorize]
        public async Task<IActionResult> Delete(Guid id)
        {
            Guid userId = Guid.Parse(User.FindFirstValue(ClaimTypes.NameIdentifier)!);
            Folder? folder = await dbcontext.Folders.Include(f => f.Bookmarks).FirstOrDefaultAsync(f => f.Id == id);
            if(folder is null) { return NotFound(); }
            if(folder.OwnerID != userId) { return StatusCode(StatusCodes.Status403Forbidden, "You cannot modify this content."); }

            folder.Bookmarks.Clear();
            dbcontext.Folders.Remove(folder);
            await dbcontext.SaveChangesAsync();
            return NoContent();
        }
    }
}
