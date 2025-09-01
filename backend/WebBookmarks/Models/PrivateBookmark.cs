namespace WebBookmarks.Models
{
    public class PrivateBookmark
    {
        public Guid Id { get; set; }
        public DateTime DateAdded { get; set; }
        public Guid AuthorId { get; set; }
        public User Author { get; set; }
        public string Cipher { get; set; }
        public string Iv { get; set; }
    }
}
