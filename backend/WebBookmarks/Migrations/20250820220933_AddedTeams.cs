using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebBookmarks.Migrations
{
    /// <inheritdoc />
    public partial class AddedTeams : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookmarkFolder_Bookmarks_BookmarkId",
                table: "BookmarkFolder");

            migrationBuilder.DropForeignKey(
                name: "FK_BookmarkFolder_Folders_FolderId",
                table: "BookmarkFolder");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookmarks_Users_AuthorID",
                table: "Bookmarks");

            migrationBuilder.RenameColumn(
                name: "FolderId",
                table: "BookmarkFolder",
                newName: "FoldersId");

            migrationBuilder.RenameColumn(
                name: "BookmarkId",
                table: "BookmarkFolder",
                newName: "BookmarksId");

            migrationBuilder.RenameIndex(
                name: "IX_BookmarkFolder_FolderId",
                table: "BookmarkFolder",
                newName: "IX_BookmarkFolder_FoldersId");

            migrationBuilder.AddColumn<Guid>(
                name: "TeamId",
                table: "Users",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.AlterColumn<Guid>(
                name: "AuthorID",
                table: "Bookmarks",
                type: "uniqueidentifier",
                nullable: true,
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier");

            migrationBuilder.AddColumn<Guid>(
                name: "TeamID",
                table: "Bookmarks",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "Teams",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Title = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Teams", x => x.Id);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Users_TeamId",
                table: "Users",
                column: "TeamId");

            migrationBuilder.CreateIndex(
                name: "IX_Bookmarks_TeamID",
                table: "Bookmarks",
                column: "TeamID");

            migrationBuilder.AddForeignKey(
                name: "FK_BookmarkFolder_Bookmarks_BookmarksId",
                table: "BookmarkFolder",
                column: "BookmarksId",
                principalTable: "Bookmarks",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_BookmarkFolder_Folders_FoldersId",
                table: "BookmarkFolder",
                column: "FoldersId",
                principalTable: "Folders",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookmarks_Teams_TeamID",
                table: "Bookmarks",
                column: "TeamID",
                principalTable: "Teams",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookmarks_Users_AuthorID",
                table: "Bookmarks",
                column: "AuthorID",
                principalTable: "Users",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Users_Teams_TeamId",
                table: "Users",
                column: "TeamId",
                principalTable: "Teams",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_BookmarkFolder_Bookmarks_BookmarksId",
                table: "BookmarkFolder");

            migrationBuilder.DropForeignKey(
                name: "FK_BookmarkFolder_Folders_FoldersId",
                table: "BookmarkFolder");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookmarks_Teams_TeamID",
                table: "Bookmarks");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookmarks_Users_AuthorID",
                table: "Bookmarks");

            migrationBuilder.DropForeignKey(
                name: "FK_Users_Teams_TeamId",
                table: "Users");

            migrationBuilder.DropTable(
                name: "Teams");

            migrationBuilder.DropIndex(
                name: "IX_Users_TeamId",
                table: "Users");

            migrationBuilder.DropIndex(
                name: "IX_Bookmarks_TeamID",
                table: "Bookmarks");

            migrationBuilder.DropColumn(
                name: "TeamId",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "TeamID",
                table: "Bookmarks");

            migrationBuilder.RenameColumn(
                name: "FoldersId",
                table: "BookmarkFolder",
                newName: "FolderId");

            migrationBuilder.RenameColumn(
                name: "BookmarksId",
                table: "BookmarkFolder",
                newName: "BookmarkId");

            migrationBuilder.RenameIndex(
                name: "IX_BookmarkFolder_FoldersId",
                table: "BookmarkFolder",
                newName: "IX_BookmarkFolder_FolderId");

            migrationBuilder.AlterColumn<Guid>(
                name: "AuthorID",
                table: "Bookmarks",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"),
                oldClrType: typeof(Guid),
                oldType: "uniqueidentifier",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_BookmarkFolder_Bookmarks_BookmarkId",
                table: "BookmarkFolder",
                column: "BookmarkId",
                principalTable: "Bookmarks",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_BookmarkFolder_Folders_FolderId",
                table: "BookmarkFolder",
                column: "FolderId",
                principalTable: "Folders",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookmarks_Users_AuthorID",
                table: "Bookmarks",
                column: "AuthorID",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
