using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebBookmarks.Migrations
{
    /// <inheritdoc />
    public partial class AddedPrivateVault : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Private",
                table: "Bookmarks");

            migrationBuilder.AddColumn<string>(
                name: "KdfSalt",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "WrapIV",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "WrappedDEK",
                table: "Users",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "KdfSalt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "WrapIV",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "WrappedDEK",
                table: "Users");

            migrationBuilder.AddColumn<bool>(
                name: "Private",
                table: "Bookmarks",
                type: "bit",
                nullable: false,
                defaultValue: false);
        }
    }
}
