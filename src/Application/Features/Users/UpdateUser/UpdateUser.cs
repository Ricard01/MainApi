using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Models;

namespace MainApi.Application.Features.Users.UpdateUser;

public record UpdateUserCommand : IRequest<IdentityResult>
{
    public Guid Id { get; init; }
    public required string Nombre { get; init; }
    public required string ApellidoPaterno { get; init; }
    public string? ApellidoMaterno { get; init; }
    public required string Email { get; init; }
    public string? Telefono { get; init; }
    public string? ImagenPerfilUrl { get; init; }
    public required Guid IdRol { get; init; }
}

public class UpdateUserCommandHandler : IRequestHandler<UpdateUserCommand, IdentityResult>
{
    private readonly IIdentityService _identityService;

    public UpdateUserCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<IdentityResult> Handle(UpdateUserCommand request, CancellationToken cancellationToken)
    {
        var user = new UserUpdateModel
        {
            Id = request.Id,
            Nombre = request.Nombre,
            ApellidoPaterno = request.ApellidoPaterno,
            ApellidoMaterno = request.ApellidoMaterno,
            Email = request.Email,
            Telefono = request.Telefono,
            ImagenPerfilUrl = request.ImagenPerfilUrl,
            IdRol = request.IdRol,
        };
        return await _identityService.UpdateUserAsync(user, cancellationToken);
    }
}