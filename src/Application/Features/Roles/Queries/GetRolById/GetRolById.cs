using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Models;

namespace MainApi.Application.Features.Roles.Queries.GetRolById;

public record GetRolByIdQuery : IRequest<RolModel>
{
    public Guid Id { get; set; }
}

public class GetRolByIdQueryHandler : IRequestHandler<GetRolByIdQuery, RolModel>
{
    private readonly IIdentityService _identityService;

    public GetRolByIdQueryHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<RolModel> Handle(GetRolByIdQuery request, CancellationToken cancellationToken)
    {
        var rol = await _identityService.GetRolByIdAsync(request.Id, cancellationToken);

        Guard.Against.NotFound(request.Id, rol);
        return rol;
    }
}