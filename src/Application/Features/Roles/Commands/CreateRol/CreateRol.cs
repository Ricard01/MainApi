using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Models;

namespace MainApi.Application.Features.Roles.Commands.CreateRol;

public record CreateRolCommand : IRequest<IdentityResult>
{
    public required string Nombre  { get; set; }
    public string? Descripcion { get; set; }
    public required List<int> PermisosIds { get; set; }
}

public class CreateRolCommandHandler : IRequestHandler<CreateRolCommand, IdentityResult>
{
    private readonly IIdentityService _identityService;

    public CreateRolCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public Task<IdentityResult> Handle(CreateRolCommand request, CancellationToken cancellationToken)
    {
        var rol = new RolCreateModel
        {
            Nombre = request.Nombre,
            Descripcion = request.Descripcion ?? "",
            PermisosIds = request.PermisosIds
        };
        return _identityService.CreateRoleAsync(rol, cancellationToken);
    }
}