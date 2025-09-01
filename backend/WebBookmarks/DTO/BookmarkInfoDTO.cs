using System.Text.Json.Serialization;
using WebBookmarks.Models;

namespace WebBookmarks.DTO
{
    public class BookmarkInfoDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public string IconURL { get; set; }
        public string Link { get; set; }
        public string BaseSite { get; set; }
        public string MediaType { get; set; }
        public bool Archived { get; set; }
        public DateTime DateAdded { get; set; } = DateTime.MinValue;

        public List<FolderInfoDTO> Folders { get; set; } = [];
    }
}
