using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NakliyeApp.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddRouteCoordinatesJson : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "RouteCoordinatesJson",
                table: "Adverts",
                type: "nvarchar(max)",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RouteCoordinatesJson",
                table: "Adverts");
        }
    }
}
