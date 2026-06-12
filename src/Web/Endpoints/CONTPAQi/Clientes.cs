using MainApi.Application.CONTPAQi.Clientes.Queries.GetAllClientes;

namespace MainApi.Web.Endpoints.CONTPAQi;

public class Clientes : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetAllClientes);
    }

    private Task<IEnumerable<ClienteDto>> GetAllClientes(ISender sender)
    {
        return sender.Send(new GetAllClientesQuery());
    }
}