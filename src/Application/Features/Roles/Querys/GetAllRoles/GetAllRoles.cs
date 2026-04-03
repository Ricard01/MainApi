using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Models;

namespace MainApi.Application.Features.Roles.Querys.GetAllRoles;

public record GetAllRolesQuery : IRequest<IEnumerable<RolListModel>>
{
}

public class GetAllRolesQuereyHandler : IRequestHandler<GetAllRolesQuery, IEnumerable<RolListModel>>
{
    private readonly IIdentityService _identityService;

    public GetAllRolesQuereyHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public Task<IEnumerable<RolListModel>> Handle(GetAllRolesQuery request, CancellationToken cancellationToken)
    {
        return _identityService.GetAllRolesAsync(cancellationToken);
    }
}