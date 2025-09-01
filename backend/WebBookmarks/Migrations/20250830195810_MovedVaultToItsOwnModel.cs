using System;
using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace WebBookmarks.Migrations
{
    /// <inheritdoc />
    public partial class MovedVaultToItsOwnModel : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "KdfHash",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "KdfIterations",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "KdfSalt",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "WrapIV",
                table: "Users");

            migrationBuilder.DropColumn(
                name: "WrappedDEK",
                table: "Users");

            migrationBuilder.AddColumn<Guid>(
                name: "VaultID",
                table: "Users",
                type: "uniqueidentifier",
                nullable: true);

            migrationBuilder.CreateTable(
                name: "PrivateVaults",
                columns: table => new
                {
                    Id = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    OwnerID = table.Column<Guid>(type: "uniqueidentifier", nullable: false),
                    KdfSalt = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    KdfIterations = table.Column<int>(type: "int", nullable: false),
                    KdfHash = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WrappedDEK = table.Column<string>(type: "nvarchar(max)", nullable: false),
                    WrapIV = table.Column<string>(type: "nvarchar(max)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PrivateVaults", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PrivateVaults_Users_OwnerID",
                        column: x => x.OwnerID,
                        principalTable: "Users",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PrivateVaults_OwnerID",
                table: "PrivateVaults",
                column: "OwnerID");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "PrivateVaults");

            migrationBuilder.DropColumn(
                name: "VaultID",
                table: "Users");

            migrationBuilder.AddColumn<string>(
                name: "KdfHash",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "KdfIterations",
                table: "Users",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "KdfSalt",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WrapIV",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "WrappedDEK",
                table: "Users",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
