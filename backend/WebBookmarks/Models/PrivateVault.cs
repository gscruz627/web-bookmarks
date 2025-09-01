namespace WebBookmarks.Models
{
    public class PrivateVault
    {
        public Guid Id { get; set; }
        public Guid OwnerID { get; set; }
        public User Owner { get; set; }
        public string KdfSalt { get; set; }
        public int KdfIterations { get; set; }
        public string KdfHash { get; set; }
        public string WrappedDEK { get; set; }
        public string WrapIV { get; set; }
    }
}
