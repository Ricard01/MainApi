using MainApi.Application.Common.Models;
using MainApi.Application.Features.Users.CreateUser;
using MainApi.Application.Features.Users.DeleteUser;
using MainApi.Application.Features.Users.UpdateUser;

namespace MainApi.Web.Endpoints;

public class User : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapPost(CreateUser)
            .MapPut(UpdateUser, "{id:guid}")
            .MapDelete(DeleteUser, "{id:guid}");
    }

    private Task<IdentityResult> CreateUser(ISender sender, CreateUserCommand command)
    {
        return sender.Send(command);
    }


    private async Task<IdentityResult> UpdateUser(ISender sender, Guid id, UpdateUserCommand command)
    {
        if (id != command.Id)
        {
            return IdentityResult.Fail("El ID del usuario no coincide con los datos proporcionados.");
        }

        return await sender.Send(command);
    }

    private Task<IdentityResult> DeleteUser(ISender sender, Guid id)
    {
        return sender.Send(new DeleteUserCommand(id));
    }
}