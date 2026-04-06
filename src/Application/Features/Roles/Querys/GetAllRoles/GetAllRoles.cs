using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Models;
using MainApi.Application.Common.Validation;
using MainApi.Domain.Constants;

namespace MainApi.Application.Features.Roles.Querys.GetAllRoles;

[RequirePermission(Permisos.Roles.Acceso)]
public record GetAllRolesQuery : IRequest<IEnumerable<RolListModel>>
{
}

public class GetAllRolesQueryHandler : IRequestHandler<GetAllRolesQuery, IEnumerable<RolListModel>>
{
    private readonly IIdentityService _identityService;

    public GetAllRolesQueryHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public Task<IEnumerable<RolListModel>> Handle(GetAllRolesQuery request, CancellationToken cancellationToken)
    {
        return _identityService.GetAllRolesAsync(cancellationToken);
    }
}