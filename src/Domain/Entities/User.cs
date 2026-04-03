using MainApi.Domain.Common;

namespace MainApi.Domain.Entities;

/// <summary>
/// Un usuario solo podra tener un Rol y cada rol contiene los permisos
/// </summary>
public class User : BaseAuditableEntity<Guid>
{
    public required string UserName { get; init; } 
    public required string Nombre { get; set; } 
    public string ApellidoPaterno { get; private set; } = default!;
    public string? ApellidoMaterno { get; private set; } 
    public string Email { get; private set; } = default!;
    public string? Telefono { get; private set; } 
    public string? ImagenPerfilUrl { get; private set; }
    public string PasswordHash { get; private set; } = default!;

    public Guid IdRol { get; private set; } = default!;
    public Rol Rol { get; private set; } = default!;

    private User() { }

    // Método de fábrica
    public static User Create(
        string userName,
        string nombre,
        string apellidoPaterno,
        string? apellidoMaterno,
        string email,
        string? telefono,
        string? imagenPerfilUrl,
        string passwordHash,
        Guid idRol
       )
    {
        var user = new User
        {
            UserName = userName,
            Nombre = nombre,
            ApellidoPaterno = apellidoPaterno,
            ApellidoMaterno = apellidoMaterno,
            Email = email,
            Telefono = telefono,
            ImagenPerfilUrl = imagenPerfilUrl,
            PasswordHash = passwordHash,
            IdRol = idRol,
        };

        return user;
    }
    
    public void Update(string nombre, string apellidoPaterno, string? apellidoMaterno, string email, string? telefono, string? imagenPerfilUrl, Guid idRol)
    {
        Nombre = nombre;
        ApellidoPaterno = apellidoPaterno;
        ApellidoMaterno = apellidoMaterno;
        Email = email;
        Telefono = telefono;
        ImagenPerfilUrl = imagenPerfilUrl;
        IdRol = idRol;
    }
    
    /// <summary>
    /// Operación de dominio para actualizar el hash (rehash/cambio de contraseña).
    /// </summary>
    public void SetPasswordHash(string newHash)
    {
        if (string.IsNullOrWhiteSpace(newHash))
            throw new ArgumentException("Password hash inválido.", nameof(newHash));

        PasswordHash = newHash;
        // aquí podrías publicar un DomainEvent PasswordChanged si lo usas
    }
}
