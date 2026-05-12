using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace MainApi.Infrastructure.Data.Migrations
{
    /// <inheritdoc />
    public partial class CONTPAQi : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.CreateTable(
                name: "ContpaqiConexiones",
                columns: table => new
                {
                    Id = table.Column<int>(type: "int", nullable: false)
                        .Annotation("SqlServer:Identity", "1, 1"),
                    Servidor = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    BaseDatos = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    SqlUser = table.Column<string>(type: "nvarchar(100)", maxLength: 100, nullable: false),
                    PasswordEncrypted = table.Column<string>(type: "nvarchar(500)", maxLength: 500, nullable: false),
                    Puerto = table.Column<int>(type: "int", nullable: false, defaultValue: 1433)
                },
                constraints: table =>
                {
                    table.PrimaryKey("PK_ContpaqiConexiones", x => x.Id);
                });
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropTable(
                name: "ContpaqiConexiones");
        }
    }
}
