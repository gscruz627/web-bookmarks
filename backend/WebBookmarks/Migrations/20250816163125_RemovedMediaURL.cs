using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebBookmarks.Migrations
{
    /// <inheritdoc />
    public partial class RemovedMediaURL : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MediaURL",
                table: "Bookmarks");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "MediaURL",
                table: "Bookmarks",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
