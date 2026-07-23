using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Portfolio.Migrations
{
    /// <inheritdoc />
    public partial class AddProfileStats : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "ProjectsStatLabel",
                table: "Profiles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Stat2Label",
                table: "Profiles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Stat2Value",
                table: "Profiles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Stat3Label",
                table: "Profiles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "Stat3Value",
                table: "Profiles",
                type: "TEXT",
                nullable: true);

            migrationBuilder.UpdateData(
                table: "Profiles",
                keyColumn: "Id",
                keyValue: 1,
                columns: new[] { "ProjectsStatLabel", "Stat2Label", "Stat2Value", "Stat3Label", "Stat3Value" },
                values: new object[] { "GAMES", "DOWNLOADS", "100K+", "YRS XP", "4+" });

            migrationBuilder.UpdateData(
                table: "Profiles",
                keyColumn: "Id",
                keyValue: 2,
                columns: new[] { "ProjectsStatLabel", "Stat2Label", "Stat2Value", "Stat3Label", "Stat3Value" },
                values: new object[] { "PROJECTS", "YRS XP", "4+", null, null });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "ProjectsStatLabel",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "Stat2Label",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "Stat2Value",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "Stat3Label",
                table: "Profiles");

            migrationBuilder.DropColumn(
                name: "Stat3Value",
                table: "Profiles");
        }
    }
}
