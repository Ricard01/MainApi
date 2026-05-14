using MainApi.Application.CONTPAQi.Conexion.Commands.SaveConexion;
using MainApi.Application.CONTPAQi.Conexion.Queries.GetConexion;
using MainApi.Domain.Entities;

namespace MainApi.Web.Endpoints.CONTPAQi;

public class Conexion : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetConexion, "contpaqi")
            .MapPost(SaveConexion, "contpaqi");
    }


    private Task<ConexionContpaqiDto?> GetConexion(ISender sender)
    {
        return sender.Send(new GetConexionQuery());
    }

    private Task<int> SaveConexion(ISender sender, SaveConexionCommand command)
    {
        return sender.Send(command);
    }
}