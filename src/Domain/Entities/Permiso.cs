namespace MainApi.Domain.Entities;

/// <summary>
/// Todos los permisos que se pueden otorgar a un usuario
/// </summary>
public class Permiso
{
    public int Id { get; set; }
    public required string Nombre { get; set; } // Ej: "User.Ver"
    public required string Modulo { get; set; } // Ej: "Usuarios"
    public string? Descripcion { get; set; }
}
