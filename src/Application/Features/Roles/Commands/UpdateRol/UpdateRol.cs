using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Models;

namespace MainApi.Application.Features.Roles.Commands.UpdateRol;

public record UpdateRolCommand : IRequest<IdentityResult>
{
    public Guid Id { get; set; }
    public required string Nombre { get; set; }
    public string?  Descripcion { get; set; }
    public required List<int> PermisosIds { get; set; }
}

public class UpdateRolCommandHandler : IRequestHandler<UpdateRolCommand, IdentityResult>
{
    private readonly IIdentityService _identityService;

    public UpdateRolCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public Task<IdentityResult> Handle(UpdateRolCommand request, CancellationToken cancellationToken)
    {
        var rol = new RolUpdateModel
        {
            Id = request.Id,
            Nombre = request.Nombre,
            Descripcion = request.Descripcion ?? "",
            PermisosIds = request.PermisosIds
        };
        
        return _identityService.UpdateRoleAsync(rol, cancellationToken);
    }
}