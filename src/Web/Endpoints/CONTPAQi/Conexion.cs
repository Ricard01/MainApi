using MainApi.Application.CONTPAQi.Conexion.Commands.CreateConexion;

namespace MainApi.Web.Endpoints.CONTPAQi;

public class Conexion : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapPost(CreateConexion,"contpaqi");
    }

    private Task<int> CreateConexion(ISender sender, CreateConexionCommand command)
    {
        return sender.Send(command);
    }
}