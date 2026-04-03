using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Models;

namespace MainApi.Application.Features.Roles.Commands.DeleteRol;

public record DeleteRolCommand(Guid Id) : IRequest<IdentityResult>;

public class DeleteRolCommandHandler : IRequestHandler<DeleteRolCommand, IdentityResult>
{
    private readonly IIdentityService _identityService;

    public DeleteRolCommandHandler(IIdentityService identityService)
    {
        _identityService = identityService;
    }

    public Task<IdentityResult> Handle(DeleteRolCommand request, CancellationToken cancellationToken)
    {
        return _identityService.DeleteRoleAsync(request.Id, cancellationToken);
    }
}