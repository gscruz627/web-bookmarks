using System.Text.Json.Serialization;

namespace WebBookmarks.Models
{
    public class Folder
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public Guid OwnerID { get; set; }
        public User Owner { get; set; }

        public List<Bookmark> Bookmarks { get; set; } = [];
    }
}
