namespace WebBookmarks.DTO
{
    public class BookmarkDTO
    {
        public string Title { get; set; }
        public string IconURL { get; set; }
        public string Link { get; set; }
        public string BaseSite { get; set; }
        public string MediaType { get; set; }
        public Guid? TeamId { get; set; }
    }
}
