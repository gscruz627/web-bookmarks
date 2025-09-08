using Microsoft.EntityFrameworkCore;
using WebBookmarks.Models;

namespace WebBookmarks.Data
{
    public class BookmarksDBContext(DbContextOptions options) : DbContext(options)
    {
        public DbSet<User> Users { get; set; }
        public DbSet<Bookmark> Bookmarks { get; set; }
        public DbSet<Folder> Folders { get; set; }
        public DbSet<Team> Teams { get; set; }
        public DbSet<PrivateVault> PrivateVaults { get; set; }
        public DbSet<PrivateBookmark> PrivateBookmarks { get; set; }

        protected override void OnModelCreating(ModelBuilder modelBuilder)
        {
            base.OnModelCreating(modelBuilder);

            // 1️⃣ Team.Owner (one-to-many)
            modelBuilder.Entity<Team>()
                .HasOne(t => t.Owner)
                .WithMany(u => u.OwnedTeams)   // make sure User has OwnedTeams list
                .HasForeignKey(t => t.OwnerID)
                .OnDelete(DeleteBehavior.Cascade); // deleting a user deletes teams they own

            // 2️⃣ Team.Members (many-to-many)
            modelBuilder.Entity<Team>()
                .HasMany(t => t.Members)
                .WithMany(u => u.Teams)
                .UsingEntity<Dictionary<string, object>>(
                    "TeamUser",
                    j => j.HasOne<User>()
                          .WithMany()
                          .HasForeignKey("MembersId")
                          .OnDelete(DeleteBehavior.NoAction), // deleting user doesn't delete team
                    j => j.HasOne<Team>()
                          .WithMany()
                          .HasForeignKey("TeamsId")
                          .OnDelete(DeleteBehavior.Cascade) // deleting team removes join entries
                );
        }
    }
}
