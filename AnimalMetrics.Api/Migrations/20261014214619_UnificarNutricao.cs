using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace AnimalMetrics.Api.Migrations
{
    /// <inheritdoc />
    public partial class UnificarNutricao : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "Nutricao");

            migrationBuilder.RenameColumn(
                name: "CurrentWeight",
                table: "DailyRecords",
                newName: "WaterConsumed");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.RenameColumn(
                name: "WaterConsumed",
                table: "DailyRecords",
                newName: "CurrentWeight");

            migrationBuilder.CreateTable(
                name: "Nutricao",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    LoteId = table.Column<int>(type: "integer", nullable: false),
                    AguaLitros = table.Column<decimal>(type: "numeric", nullable: false),
                    DataRegistro = table.Column<DateTime>(type: "timestamp with time zone", nullable: false),
                    RacaoGramas = table.Column<decimal>(type: "numeric", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_Nutricao", x => x.Id);
                    table.ForeignKey(
                        name: "FK_Nutricao_Lotes_LoteId",
                        column: x => x.LoteId,
                        principalTable: "Lotes",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_Nutricao_LoteId",
                table: "Nutricao",
                column: "LoteId");
        }
    }
}
