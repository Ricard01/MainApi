using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Models;

namespace MainApi.Application.Features.Users.Queries.GetAllUsers;

public record GetAllUsersQuery : IRequest<IEnumerable<UserListModel>>
{
}

public class GetAllUsersQueryHandler : IRequestHandler<GetAllUsersQuery, IEnumerable<UserListModel>>
{
    private readonly IIdentityService _identityService;

    public GetAllUsersQueryHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public async Task<IEnumerable<UserListModel>> Handle(GetAllUsersQuery request, CancellationToken cancellationToken)
    {
        return await _identityService.GetAllUsersAsync(cancellationToken);
    }
}