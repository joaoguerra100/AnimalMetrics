using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace AnimalMetrics.Api.Migrations
{
    /// <inheritdoc />
    public partial class AlterDailyRecordToLote : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DailyRecords_Animals_AnimalId",
                table: "DailyRecords");

            migrationBuilder.AlterColumn<int>(
                name: "AnimalId",
                table: "DailyRecords",
                type: "integer",
                nullable: true,
                oldClrType: typeof(int),
                oldType: "integer");

            migrationBuilder.AddColumn<int>(
                name: "LoteId",
                table: "DailyRecords",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateIndex(
                name: "IX_DailyRecords_LoteId",
                table: "DailyRecords",
                column: "LoteId");

            migrationBuilder.AddForeignKey(
                name: "FK_DailyRecords_Animals_AnimalId",
                table: "DailyRecords",
                column: "AnimalId",
                principalTable: "Animals",
                principalColumn: "Id");

            migrationBuilder.AddForeignKey(
                name: "FK_DailyRecords_Lotes_LoteId",
                table: "DailyRecords",
                column: "LoteId",
                principalTable: "Lotes",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_DailyRecords_Animals_AnimalId",
                table: "DailyRecords");

            migrationBuilder.DropForeignKey(
                name: "FK_DailyRecords_Lotes_LoteId",
                table: "DailyRecords");

            migrationBuilder.DropIndex(
                name: "IX_DailyRecords_LoteId",
                table: "DailyRecords");

            migrationBuilder.DropColumn(
                name: "LoteId",
                table: "DailyRecords");

            migrationBuilder.AlterColumn<int>(
                name: "AnimalId",
                table: "DailyRecords",
                type: "integer",
                nullable: false,
                defaultValue: 0,
                oldClrType: typeof(int),
                oldType: "integer",
                oldNullable: true);

            migrationBuilder.AddForeignKey(
                name: "FK_DailyRecords_Animals_AnimalId",
                table: "DailyRecords",
                column: "AnimalId",
                principalTable: "Animals",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }
    }
}
