using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Models;

namespace MainApi.Application.Features.Users.Commands.CreateUser;

public record CreateUserCommand : IRequest<IdentityResult>
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

public class CreateUserCommandHandler : IRequestHandler<CreateUserCommand, IdentityResult>
{
    private readonly IIdentityService _identityService;

    public CreateUserCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<IdentityResult> Handle(CreateUserCommand request, CancellationToken cancellationToken)
    {
        var user = new UserModel
        {
            UserName = request.UserName,
            Nombre = request.Nombre,
            ApellidoPaterno = request.ApellidoPaterno,
            ApellidoMaterno = request.ApellidoMaterno,
            Email = request.Email,
            Telefono = request.Telefono,
            Password = request.Password,
            ImagenPerfilUrl = request.ImagenPerfilUrl,
            IdRol = request.IdRol
        };
        return await _identityService.CreateUserAsync(user, cancellationToken);
    }
}