using System;
using Microsoft.EntityFrameworkCore.Migrations;
using Npgsql.EntityFrameworkCore.PostgreSQL.Metadata;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddPurchaseInvoicesFeature : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "Date",
                table: "PurchaseInvoices");

            migrationBuilder.DropColumn(
                name: "DueDate",
                table: "PurchaseInvoices");

            migrationBuilder.DropColumn(
                name: "InvoiceNo",
                table: "PurchaseInvoices");

            migrationBuilder.DropColumn(
                name: "Status",
                table: "PurchaseInvoices");

            migrationBuilder.DropColumn(
                name: "VendorName",
                table: "PurchaseInvoices");

            migrationBuilder.RenameColumn(
                name: "UpdatedAt",
                table: "PurchaseInvoices",
                newName: "InvoiceDate");

            migrationBuilder.AlterColumn<decimal>(
                name: "TotalAmount",
                table: "PurchaseInvoices",
                type: "numeric(18,2)",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric");

            migrationBuilder.AddColumn<int>(
                name: "CreatedByAdminId",
                table: "PurchaseInvoices",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.AddColumn<string>(
                name: "InvoiceNumber",
                table: "PurchaseInvoices",
                type: "character varying(50)",
                maxLength: 50,
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Notes",
                table: "PurchaseInvoices",
                type: "text",
                nullable: true);

            migrationBuilder.AddColumn<int>(
                name: "VendorId",
                table: "PurchaseInvoices",
                type: "integer",
                nullable: false,
                defaultValue: 0);

            migrationBuilder.CreateTable(
                name: "PurchaseInvoiceItems",
                columns: table => new
                {
                    Id = table.Column<int>(type: "integer", nullable: false)
                        .Annotation("Npgsql:ValueGenerationStrategy", NpgsqlValueGenerationStrategy.IdentityByDefaultColumn),
                    PurchaseInvoiceId = table.Column<int>(type: "integer", nullable: false),
                    PartId = table.Column<int>(type: "integer", nullable: false),
                    Quantity = table.Column<int>(type: "integer", nullable: false),
                    UnitPrice = table.Column<decimal>(type: "numeric(18,2)", nullable: false),
                    Subtotal = table.Column<decimal>(type: "numeric(18,2)", nullable: false)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_PurchaseInvoiceItems", x => x.Id);
                    table.ForeignKey(
                        name: "FK_PurchaseInvoiceItems_Parts_PartId",
                        column: x => x.PartId,
                        principalTable: "Parts",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                    table.ForeignKey(
                        name: "FK_PurchaseInvoiceItems_PurchaseInvoices_PurchaseInvoiceId",
                        column: x => x.PurchaseInvoiceId,
                        principalTable: "PurchaseInvoices",
                        principalColumn: "Id",
                        onDelete: ReferentialAction.Cascade);
                });

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseInvoices_CreatedByAdminId",
                table: "PurchaseInvoices",
                column: "CreatedByAdminId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseInvoices_VendorId",
                table: "PurchaseInvoices",
                column: "VendorId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseInvoiceItems_PartId",
                table: "PurchaseInvoiceItems",
                column: "PartId");

            migrationBuilder.CreateIndex(
                name: "IX_PurchaseInvoiceItems_PurchaseInvoiceId",
                table: "PurchaseInvoiceItems",
                column: "PurchaseInvoiceId");

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseInvoices_Users_CreatedByAdminId",
                table: "PurchaseInvoices",
                column: "CreatedByAdminId",
                principalTable: "Users",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);

            migrationBuilder.AddForeignKey(
                name: "FK_PurchaseInvoices_Vendors_VendorId",
                table: "PurchaseInvoices",
                column: "VendorId",
                principalTable: "Vendors",
                principalColumn: "Id",
                onDelete: ReferentialAction.Cascade);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseInvoices_Users_CreatedByAdminId",
                table: "PurchaseInvoices");

            migrationBuilder.DropForeignKey(
                name: "FK_PurchaseInvoices_Vendors_VendorId",
                table: "PurchaseInvoices");

            migrationBuilder.DropTable(
                name: "PurchaseInvoiceItems");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseInvoices_CreatedByAdminId",
                table: "PurchaseInvoices");

            migrationBuilder.DropIndex(
                name: "IX_PurchaseInvoices_VendorId",
                table: "PurchaseInvoices");

            migrationBuilder.DropColumn(
                name: "CreatedByAdminId",
                table: "PurchaseInvoices");

            migrationBuilder.DropColumn(
                name: "InvoiceNumber",
                table: "PurchaseInvoices");

            migrationBuilder.DropColumn(
                name: "Notes",
                table: "PurchaseInvoices");

            migrationBuilder.DropColumn(
                name: "VendorId",
                table: "PurchaseInvoices");

            migrationBuilder.RenameColumn(
                name: "InvoiceDate",
                table: "PurchaseInvoices",
                newName: "UpdatedAt");

            migrationBuilder.AlterColumn<decimal>(
                name: "TotalAmount",
                table: "PurchaseInvoices",
                type: "numeric",
                nullable: false,
                oldClrType: typeof(decimal),
                oldType: "numeric(18,2)");

            migrationBuilder.AddColumn<DateTime>(
                name: "Date",
                table: "PurchaseInvoices",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<DateTime>(
                name: "DueDate",
                table: "PurchaseInvoices",
                type: "timestamp with time zone",
                nullable: false,
                defaultValue: new DateTime(1, 1, 1, 0, 0, 0, 0, DateTimeKind.Unspecified));

            migrationBuilder.AddColumn<string>(
                name: "InvoiceNo",
                table: "PurchaseInvoices",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "Status",
                table: "PurchaseInvoices",
                type: "text",
                nullable: false,
                defaultValue: "");

            migrationBuilder.AddColumn<string>(
                name: "VendorName",
                table: "PurchaseInvoices",
                type: "text",
                nullable: false,
                defaultValue: "");
        }
    }
}
