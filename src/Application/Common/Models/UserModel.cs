namespace MainApi.Application.Common.Models;

public class UserModel
{
    public required string UserName { get; init; }  
    public required string Nombre { get; init; }
    public required string  ApellidoPaterno { get; init; }
    public string? ApellidoMaterno { get; init; }
    public required string Email { get; init; }
    public required string Telefono { get; init; }
    public required string Password { get; init; }
    public string? ImagenPerfilUrl { get; init; }
    public required Guid IdRol { get; init; } 
}
