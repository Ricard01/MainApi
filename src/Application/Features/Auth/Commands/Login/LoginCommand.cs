using MainApi.Application.Common.Interfaces;

namespace MainApi.Application.Features.Auth.Commands.Login;

/// <summary>
/// Comando para iniciar sesión de un usuario.
/// </summary>
/// <param name="UserName">Nombre de usuario.</param>
/// <param name="Password">Contraseña del usuario.</param>
/// /// <param name="RememberMe">Recordar  usuario.</param>
public record LoginCommand(string UserName, string Password, bool RememberMe) : IRequest<AuthUser>;

/// <summary>
/// Representa al usuario autenticado que el SPA necesita para hidratar su estado.
/// No incluye datos sensibles.
/// </summary>
public record AuthUser(
    string Nombre,
    string? ImagenUrl,
    string Rol,
    List<string> Permisos);

public record AuthResult
{
    public bool Success { get; init; }
    public string? Message { get; init; }
    public AuthUser? User { get; init; }
}

/// <summary>
/// Handler del comando Login.
/// Flujo:
/// 1. Válida que el usuario exista y la contraseña sea correcta.
/// 2. Genera una cookie de sesión (IMSS.Cookie) 
/// </summary>
public sealed class LoginCommandHandler : IRequestHandler<LoginCommand, AuthUser>
{
    private readonly IIdentityService _identityService;

    public LoginCommandHandler( IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<AuthUser> Handle(LoginCommand request, CancellationToken cancellationToken)
    {
        return  await _identityService.SignInAsync(request.UserName, request.Password, request.RememberMe, cancellationToken);
        
    }
}
