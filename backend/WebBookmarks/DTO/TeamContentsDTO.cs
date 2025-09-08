using System.ComponentModel.DataAnnotations.Schema;
using System.Text.Json.Serialization;
using WebBookmarks.Models;

namespace WebBookmarks.DTO
{
    public class TeamContentsDTO
    {
        public Guid Id { get; set; }
        public string Title { get; set; }
        public Guid OwnerID { get; set; }
        public UserInfoDTO Owner { get; set; }
        public List<UserInfoDTO> Members { get; set; } = [];
        public List<BookmarkInfoDTO> Bookmarks { get; set; } = [];
    }
}
