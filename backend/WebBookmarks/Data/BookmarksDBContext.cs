using Microsoft.EntityFrameworkCore;
using WebBookmarks.Models;

namespace WebBookmarks.Data
{
    public class BookmarksDBContext : DbContext
    {
        public BookmarksDBContext(DbContextOptions options) : base(options)
        {
        }

        public DbSet<User> Users { get; set; }
        public DbSet<Bookmark> Bookmarks { get; set; }
        public DbSet<Folder> Folders { get; set; }
    }
}
