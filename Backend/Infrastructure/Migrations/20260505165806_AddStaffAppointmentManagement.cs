using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Infrastructure.Migrations
{
    /// <inheritdoc />
    public partial class AddStaffAppointmentManagement : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<int>(
                name: "AssignedStaffId",
                table: "ServiceAppointments",
                type: "integer",
                nullable: true);

            migrationBuilder.AddColumn<string>(
                name: "CancellationReason",
                table: "ServiceAppointments",
                type: "character varying(500)",
                maxLength: 500,
                nullable: true);

            migrationBuilder.CreateIndex(
                name: "IX_ServiceAppointments_AssignedStaffId",
                table: "ServiceAppointments",
                column: "AssignedStaffId");

            migrationBuilder.AddForeignKey(
                name: "FK_ServiceAppointments_Users_AssignedStaffId",
                table: "ServiceAppointments",
                column: "AssignedStaffId",
                principalTable: "Users",
                principalColumn: "Id");
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropForeignKey(
                name: "FK_ServiceAppointments_Users_AssignedStaffId",
                table: "ServiceAppointments");

            migrationBuilder.DropIndex(
                name: "IX_ServiceAppointments_AssignedStaffId",
                table: "ServiceAppointments");

            migrationBuilder.DropColumn(
                name: "AssignedStaffId",
                table: "ServiceAppointments");

            migrationBuilder.DropColumn(
                name: "CancellationReason",
                table: "ServiceAppointments");
        }
    }
}
