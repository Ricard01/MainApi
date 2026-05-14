namespace MainApi.Application.CONTPAQi.Conexion.Queries.GetConexion;

public class ConexionContpaqiDto
{
    public required string Servidor { get; init; }
    public required string BaseDatos { get; init; }
    public required string SqlUser { get; init; }
    public int Puerto { get; init; } = 1433;
}