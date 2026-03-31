using MainApi.Domain.Common;

namespace MainApi.Domain.Entities;

public class Permiso : BaseEntity
{
    public required string Nombre { get; set; } // Ej: "Usuarios.Ver"
    public required string Modulo { get; set; } // Ej: "Usuarios"
    public string? Descripcion { get; set; }
}
