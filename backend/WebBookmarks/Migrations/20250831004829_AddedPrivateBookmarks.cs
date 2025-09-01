using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebBookmarks.Migrations
{
    /// <inheritdoc />
    public partial class AddedPrivateBookmarks : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "PrivateBookmarks",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    DateAdded = table.Column<DateTime>(type: "datetime2", nullable: false),
                    AuthorId = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    Cipher = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    Iv = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrivateBookmarks", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrivateBookmarks_Users_AuthorId",
                        column: x => x.AuthorId,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PrivateBookmarks_AuthorId",
                table: "PrivateBookmarks",
                column: "AuthorId");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PrivateBookmarks");
        }
    }
}
