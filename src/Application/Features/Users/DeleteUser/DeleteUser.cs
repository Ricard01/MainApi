using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Models;

namespace MainApi.Application.Features.Users.DeleteUser;

public record DeleteUserCommand(Guid Id) : IRequest<IdentityResult>;

public record DeleteUserCommandHandler : IRequestHandler<DeleteUserCommand, IdentityResult>
{
    private readonly IIdentityService _identityService;

    public DeleteUserCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public Task<IdentityResult> Handle(DeleteUserCommand request, CancellationToken cancellationToken)
    {
        return _identityService.DeleteUserAsync(request.Id, cancellationToken);
    }
}