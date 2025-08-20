using System.Text.Json.Serialization;

namespace WebBookmarks.Models
{
    public class User
    {
        public Guid Id { get; set; }
        public string Username { get; set; }
        public string Password { get; set; }
        public string? AccessToken { get; set; }
        public string? RefreshToken { get; set; }
        public DateTime? RefreshTokenExpiryDate { get; set; }

        [JsonIgnore]
        public List<Bookmark> Bookmarks { get; set; } = [];
    }
}
