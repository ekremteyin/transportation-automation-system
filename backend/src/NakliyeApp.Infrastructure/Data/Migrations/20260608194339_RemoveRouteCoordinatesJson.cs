using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NakliyeApp.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class RemoveRouteCoordinatesJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RouteCoordinatesJson",
                table: "Adverts");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RouteCoordinatesJson",
                table: "Adverts",
                type: "nvarchar(max)",
                nullable: true);
        }
    }
}
