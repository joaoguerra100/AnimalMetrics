using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnimalMetrics.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddRationPriceToAnimal : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<decimal>(
                name: "RationPricePerKg",
                table: "Animals",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "RationPricePerKg",
                table: "Animals");
        }
    }
}
