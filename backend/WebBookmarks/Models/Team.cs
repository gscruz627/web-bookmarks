using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;

namespace WebBookmarks.Models
{
    public class Team
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public Guid OwnerID { get; set; }
        [JsonIgnore]
        [ForeignKey("OwnerID")]
        public User Owner { get; set; }

        public List<User> Members { get; set; } = [];

        [JsonIgnore]
        public List<Bookmark> Bookmarks { get; set; } = [];
    }
}
