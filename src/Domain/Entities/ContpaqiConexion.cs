namespace MainApi.Domain.Entities;

public class ContpaqiConexion
{
    public int Id { get; set; }
    public string Servidor { get; set; } = null!;
    public required string BaseDatos { get; set; }
    public required string SqlUser { get; set; }
    public required string PasswordEncrypted { get; set; }
    public int Puerto { get; set; } = 1433;
}