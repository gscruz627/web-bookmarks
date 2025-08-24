using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebBookmarks.Migrations
{
    /// <inheritdoc />
    public partial class TestingTeamRelation : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookmarks_Teams_TeamID",
                table: "Bookmarks");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookmarks_Users_AuthorID",
                table: "Bookmarks");

            migrationBuilder.DropForeignKey(
                name: "FK_TeamUser_Users_MembersId",
                table: "TeamUser");

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
                name: "FK_TeamUser_Users_MembersId",
                table: "TeamUser",
                column: "MembersId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookmarks_Teams_TeamID",
                table: "Bookmarks");

            migrationBuilder.DropForeignKey(
                name: "FK_Bookmarks_Users_AuthorID",
                table: "Bookmarks");

            migrationBuilder.DropForeignKey(
                name: "FK_TeamUser_Users_MembersId",
                table: "TeamUser");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookmarks_Teams_TeamID",
                table: "Bookmarks",
                column: "TeamID",
                principalTable: "Teams",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_Bookmarks_Users_AuthorID",
                table: "Bookmarks",
                column: "AuthorID",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Restrict);

            migrationBuilder.AddForeignKey(
                name: "FK_TeamUser_Users_MembersId",
                table: "TeamUser",
                column: "MembersId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
