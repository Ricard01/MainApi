using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Models;

namespace MainApi.Application.Features.Users.ChangePassword;

public record ChangePasswordCommand(Guid Id, string NewPassword) : IRequest<IdentityResult>;

public class ChangePasswordCommandHandler(IIdentityService identityService) : IRequestHandler<ChangePasswordCommand, IdentityResult>
{
    public Task<IdentityResult> Handle(ChangePasswordCommand request, CancellationToken cancellationToken)
    {
        return identityService.ChangePasswordAsync(request.Id, request.NewPassword, cancellationToken);
    }
}