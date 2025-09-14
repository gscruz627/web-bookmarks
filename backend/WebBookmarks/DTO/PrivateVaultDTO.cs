using WebBookmarks.Models;

namespace WebBookmarks.DTO
{
    public class PrivateVaultDTO
    {
        public string KdfSalt { get; set; }
        public int KdfIterations { get; set; }
        public string KdfHash { get; set; }
        public string WrappedDEK { get; set; }
        public string WrapIV { get; set; }
    }
}
