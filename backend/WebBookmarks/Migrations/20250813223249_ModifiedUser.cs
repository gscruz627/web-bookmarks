using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebBookmarks.Migrations
{
    /// <inheritdoc />
    public partial class ModifiedUser : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookmarks_Users_UserId",
                table: "Bookmarks");

            migrationBuilder.DropIndex(
                name: "IX_Bookmarks_UserId",
                table: "Bookmarks");

            migrationBuilder.DropColumn(
                name: "UserId",
                table: "Bookmarks");

            migrationBuilder.RenameColumn(
                name: "Email",
                table: "Users",
                newName: "Username");

            migrationBuilder.AddColumn<string>(
                name: "AccessToken",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "RefreshToken",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<DateTime>(
                name: "RefreshTokenExpiryDate",
                table: "Users",
                type: "datetime2",
                nullable: true);

            migrationBuilder.AddColumn<Guid>(
                name: "AuthorID",
                table: "Bookmarks",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Bookmarks_AuthorID",
                table: "Bookmarks",
                column: "AuthorID");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookmarks_Users_AuthorID",
                table: "Bookmarks",
                column: "AuthorID",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Bookmarks_Users_AuthorID",
                table: "Bookmarks");

            migrationBuilder.DropIndex(
                name: "IX_Bookmarks_AuthorID",
                table: "Bookmarks");

            migrationBuilder.DropColumn(
                name: "AccessToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RefreshToken",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "RefreshTokenExpiryDate",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "AuthorID",
                table: "Bookmarks");

            migrationBuilder.RenameColumn(
                name: "Username",
                table: "Users",
                newName: "Email");

            migrationBuilder.AddColumn<Guid>(
                name: "UserId",
                table: "Bookmarks",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_Bookmarks_UserId",
                table: "Bookmarks",
                column: "UserId");

            migrationBuilder.AddForeignKey(
                name: "FK_Bookmarks_Users_UserId",
                table: "Bookmarks",
                column: "UserId",
                principalTable: "Users",
                principalColumn: "Id");
        }
    }
}
