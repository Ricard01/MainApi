using MainApi.Application.Common.Interfaces;

namespace MainApi.Application.Features.Auth.Commands.LogOut;

public sealed record LogoutCommand : IRequest;

public class LogoutCommandHandler(IIdentityService identityService) : IRequestHandler<LogoutCommand>
{
    public async Task Handle(LogoutCommand request, CancellationToken cancellationToken)
    {
         await identityService.SignOutAsync(cancellationToken);
    }
}
