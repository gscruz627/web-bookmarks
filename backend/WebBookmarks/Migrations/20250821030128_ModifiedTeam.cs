using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebBookmarks.Migrations
{
    /// <inheritdoc />
    public partial class ModifiedTeam : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<Guid>(
                name: "OwnerID",
                table: "Teams",
                type: "uniqueidentifier",
                nullable: false,
                defaultValue: new Guid("00000000-0000-0000-0000-000000000000"));

            migrationBuilder.CreateIndex(
                name: "IX_Teams_OwnerID",
                table: "Teams",
                column: "OwnerID");

            migrationBuilder.AddForeignKey(
                name: "FK_Teams_Users_OwnerID",
                table: "Teams",
                column: "OwnerID",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_Teams_Users_OwnerID",
                table: "Teams");

            migrationBuilder.DropIndex(
                name: "IX_Teams_OwnerID",
                table: "Teams");

            migrationBuilder.DropColumn(
                name: "OwnerID",
                table: "Teams");
        }
    }
}
