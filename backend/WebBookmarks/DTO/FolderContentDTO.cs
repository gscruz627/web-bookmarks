using WebBookmarks.Models;

namespace WebBookmarks.DTO
{
    public class FolderContentDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; }

        public List<Bookmark> Bookmarks { get; set; } = [];
    }
}
