using MainApi.Application.Common.Models;
using MainApi.Application.Features.Users.Commands.ChangePassword;
using MainApi.Application.Features.Users.Commands.CreateUser;
using MainApi.Application.Features.Users.Commands.DeleteUser;
using MainApi.Application.Features.Users.Commands.UpdateUser;
using MainApi.Application.Features.Users.Queries.GetAllUsers;
using MainApi.Application.Features.Users.Queries.GetUserById;

namespace MainApi.Web.Endpoints;

public class User : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetAllUsers)
            .MapGet(GetUserById, "{id:guid}")
            .MapPost(CreateUser)
            .MapPut(UpdateUser, "{id:guid}")
            .MapDelete(DeleteUser, "{id:guid}")
            .MapPatch("{id:guid}/change-password", ChangeUserPassword);
    }

    private Task<IEnumerable<UserListModel>> GetAllUsers(ISender sender)
    {
        return sender.Send(new GetAllUsersQuery());
    }

    private Task<UserModel> GetUserById(ISender sender, Guid id)
    {
        return sender.Send(new GetUserByIdQuery { Id = id });
    }

    private async Task<IdentityResult> ChangeUserPassword(ISender sender, Guid id, ChangePasswordCommand command)
    {
        if (id != command.Id)
        {
            return IdentityResult.Fail("El ID del usuario no coincide.");
        }

        return await sender.Send(command);
    }

    private Task<IdentityResult> CreateUser(ISender sender, CreateUserCommand command)
    {
        var user = sender.Send(command);
        return user;
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