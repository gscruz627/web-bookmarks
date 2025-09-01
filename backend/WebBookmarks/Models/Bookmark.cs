using System.Text.Json.Serialization;

namespace WebBookmarks.Models
{
    public class Bookmark
    {
        public Guid Id {  get; set; }
        public string Title { get; set; }
        public string IconURL { get; set; }
        public string Link { get; set; }
        public string BaseSite { get; set; }
        public string MediaType { get; set; }
        public bool Archived { get; set; }
        public DateTime DateAdded { get; set; } = DateTime.MinValue;

        [JsonIgnore]
        public List<Folder> Folders { get; set; } = [];
        
        public Guid? AuthorID { get; set; }
        public User? Author { get; set; }

        public Guid? TeamID { get; set; }
        public Team? Team { get; set; }
    }
}
