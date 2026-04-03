using MainApi.Application.Common.Models;
using MainApi.Application.Features.Roles.Commands.CreateRol;
using MainApi.Application.Features.Roles.Commands.DeleteRol;
using MainApi.Application.Features.Roles.Commands.UpdateRol;
using MainApi.Application.Features.Roles.Querys.GetAllRoles;
using MainApi.Application.Features.Roles.Querys.GetRolById;

namespace MainApi.Web.Endpoints;

public class Rol : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetAllRoles)
            .MapGet(GetRolById, "{id:guid}")
            .MapPost(CreateRol)
            .MapPut(UpdateRol, "{id:guid}")
            .MapDelete(DeleteRol, "{id:guid}");
    }

    private Task<IEnumerable<RolListModel>> GetAllRoles(ISender sender)
    {
        return sender.Send(new GetAllRolesQuery());
    }

    private Task<RolModel> GetRolById(ISender sender, Guid id)
    {
        return sender.Send(new GetRolByIdQuery { Id = id });
    }

    private Task<IdentityResult> CreateRol(ISender sender, CreateRolCommand command)
    {
        return sender.Send(command);
    }

    private async Task<IdentityResult> UpdateRol(ISender sender, Guid id, UpdateRolCommand command)
    {
        if (id != command.Id)
        {
            return IdentityResult.Fail("El ID del usuario no coincide con los datos proporcionados.");
        }

        return await sender.Send(command);
    }

    private Task<IdentityResult> DeleteRol(ISender sender, Guid id)
    {
        return sender.Send(new DeleteRolCommand(id));
    }
}