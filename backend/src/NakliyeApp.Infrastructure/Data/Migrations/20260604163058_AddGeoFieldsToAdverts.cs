using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace NakliyeApp.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class AddGeoFieldsToAdverts : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<double>(
                name: "DestLat",
                table: "Adverts",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "DestLng",
                table: "Adverts",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "DistanceKm",
                table: "Adverts",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "EstimatedDurationMin",
                table: "Adverts",
                type: "int",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "OriginLat",
                table: "Adverts",
                type: "float",
                nullable: true);

            migrationBuilder.AddColumn<double>(
                name: "OriginLng",
                table: "Adverts",
                type: "float",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "DestLat",
                table: "Adverts");

            migrationBuilder.DropColumn(
                name: "DestLng",
                table: "Adverts");

            migrationBuilder.DropColumn(
                name: "DistanceKm",
                table: "Adverts");

            migrationBuilder.DropColumn(
                name: "EstimatedDurationMin",
                table: "Adverts");

            migrationBuilder.DropColumn(
                name: "OriginLat",
                table: "Adverts");

            migrationBuilder.DropColumn(
                name: "OriginLng",
                table: "Adverts");
        }
    }
}
