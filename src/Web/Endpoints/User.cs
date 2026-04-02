using MainApi.Application.Common.Models;
using MainApi.Application.Features.Users.CreateUser;

namespace MainApi.Web.Endpoints;

public class User : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapPost(CreateUser);
    }
    
    Task<IdentityResult> CreateUser(ISender sender, CreateUserCommand command)
    {
        return sender.Send(command);
    }
}