namespace MainApi.Application.Common.Models;

public class UserModel
{
    public Guid Id { get; set; }
    public required string UserName { get; init; }
    public required string Nombre { get; init; }
    public required string ApellidoPaterno { get; init; }
    public string? ApellidoMaterno { get; init; }
    public required string Email { get; init; }
    public string? Telefono { get; init; }
    public string? ImagenPerfilUrl { get; init; }
    public required Guid IdRol { get; init; }
    public required string RolName { get; set; }
    public bool IsActive { get; set; }
}

public class UserListModel
{
    public Guid Id { get; set; }
    public required string UserName { get; init; }
    public required string Nombre { get; init; }
    public required string Email { get; init; }
    public string? Telefono { get; init; }
    public string? ImagenPerfilUrl { get; init; }
    public required string RolName { get; set; }
    public bool IsActive { get; init; }
}

public class UserCreateModel
{
    public required string UserName { get; init; }
    public required string Nombre { get; init; }
    public required string ApellidoPaterno { get; init; }
    public string? ApellidoMaterno { get; init; }
    public required string Email { get; init; }
    public string? Telefono { get; init; }
    public required string Password { get; init; }
    public string? ImagenPerfilUrl { get; init; }
    public required Guid IdRol { get; init; }
}

public class UserUpdateModel
{
    public required Guid Id { get; init; }
    public required string Nombre { get; init; }
    public required string ApellidoPaterno { get; init; }
    public string? ApellidoMaterno { get; init; }
    public required string Email { get; init; }
    public string? Telefono { get; init; }
    public string? ImagenPerfilUrl { get; init; }
    public bool IsActive { get; init; }
    public required Guid IdRol { get; init; }
}