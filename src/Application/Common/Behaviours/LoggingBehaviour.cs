using MainApi.Application.Common.Interfaces;
using MediatR.Pipeline;
using Microsoft.Extensions.Logging;

namespace MainApi.Application.Common.Behaviours;

public class LoggingBehaviour<TRequest> : IRequestPreProcessor<TRequest>
    where TRequest : notnull
{
    private readonly ILogger _logger;
    private readonly IUser _user;

    public LoggingBehaviour(ILogger<TRequest> logger, IUser user)
    {
        _logger = logger;
        _user = user;
    }

    public  Task Process(TRequest request, CancellationToken cancellationToken)
    {
        var requestName = typeof(TRequest).Name;
        var userId = _user.Id ?? string.Empty;
        string? userName =  _user.UserName ??string.Empty;

        // if (!string.IsNullOrEmpty(userId))
        // {
        //     userName = await _identityService.GetUserNameAsync(userId);
        // }

        _logger.LogInformation("MainApi Request: {Name} {@UserId} {@UserName} {@Request}",
            requestName, userId, userName, request);
        
        return Task.CompletedTask;
    }
}
