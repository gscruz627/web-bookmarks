namespace WebBookmarks.DTO
{
    public class PrivateBookmarkInfoDTO
    {
        public Guid Id { get; set; }
        public string Cipher { get; set; }
        public string Iv { get; set; }
        public DateTime DateAdded { get; set; }
    }
}
