using MainApi.Application.Common.Interfaces;
using MainApi.Application.Features.Auth.Commands.Login;

namespace MainApi.Application.Features.Auth.Queries.Me;

public record MeQuery : IRequest<AuthUser?>;

public  class MeQueryHandler : IRequestHandler<MeQuery, AuthUser?>
{
    private readonly IIdentityService _identityService;

    public MeQueryHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public Task<AuthUser?> Handle(MeQuery request, CancellationToken cancellationToken)
    {
        return _identityService.Me();
    }
}