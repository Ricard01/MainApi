using MainApi.Application.CONTPAQi.Agentes.Queries.GetAllAgentes;

namespace MainApi.Web.Endpoints.CONTPAQi;

public class Agentes : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetAllAgentes);
    }

    private Task<IEnumerable<AgenteDto>> GetAllAgentes(ISender sender)
    {
        return sender.Send(new GetAllAgentesQuery());
    }
}