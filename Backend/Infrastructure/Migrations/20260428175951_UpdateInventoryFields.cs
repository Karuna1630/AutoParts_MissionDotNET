using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class UpdateInventoryFields : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "MinStock",
                table: "InventoryItems");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "InventoryItems");

            migrationBuilder.RenameColumn(
                name: "Quantity",
                table: "InventoryItems",
                newName: "Stock");

            migrationBuilder.AddColumn<decimal>(
                name: "Price",
                table: "InventoryItems",
                type: "numeric",
                nullable: false,
                defaultValue: 0m);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Price",
                table: "InventoryItems");

            migrationBuilder.RenameColumn(
                name: "Stock",
                table: "InventoryItems",
                newName: "Quantity");

            migrationBuilder.AddColumn<int>(
                name: "MinStock",
                table: "InventoryItems",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "InventoryItems",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
