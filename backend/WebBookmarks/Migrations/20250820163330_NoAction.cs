using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebBookmarks.Migrations
{
    /// <inheritdoc />
    public partial class NoAction : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookmarks_Folders_FolderId",
                table: "Bookmarks");

            migrationBuilder.DropIndex(
                name: "IX_Bookmarks_FolderId",
                table: "Bookmarks");

            migrationBuilder.DropColumn(
                name: "FolderId",
                table: "Bookmarks");

            migrationBuilder.DropColumn(
                name: "Folders",
                table: "Bookmarks");

            migrationBuilder.CreateTable(
    name: "BookmarkFolder",
    columns: table => new
    {
        BookmarkId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
        FolderId = table.Column<Guid>(type: "uniqueidentifier", nullable: false)
    },
    constraints: table =>
    {
        table.PrimaryKey("PK_BookmarkFolder", x => new { x.BookmarkId, x.FolderId });
        table.ForeignKey(
            name: "FK_BookmarkFolder_Bookmarks_BookmarkId",
            column: x => x.BookmarkId,
            principalTable: "Bookmarks",
            principalColumn: "Id",
            onDelete: ReferentialAction.NoAction);  // <--- important
        table.ForeignKey(
            name: "FK_BookmarkFolder_Folders_FolderId",
            column: x => x.FolderId,
            principalTable: "Folders",
            principalColumn: "Id",
            onDelete: ReferentialAction.NoAction);  // <--- important
    });


            migrationBuilder.CreateIndex(
                name: "IX_BookmarkFolder_FolderId",
                table: "BookmarkFolder",
                column: "FolderId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "BookmarkFolder");

            migrationBuilder.AddColumn<Guid>(
                name: "FolderId",
                table: "Bookmarks",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Folders",
                table: "Bookmarks",
                type: "nvarchar(max)",
                nullable: false,
                defaultValue: "");

            migrationBuilder.CreateIndex(
                name: "IX_Bookmarks_FolderId",
                table: "Bookmarks",
                column: "FolderId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookmarks_Folders_FolderId",
                table: "Bookmarks",
                column: "FolderId",
                principalTable: "Folders",
                principalColumn: "Id");
        }
    }
}
