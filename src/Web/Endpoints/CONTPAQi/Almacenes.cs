using MainApi.Application.CONTPAQi.Almacenes.Queries.GetAllAlmacenes;

namespace MainApi.Web.Endpoints.CONTPAQi;

public class Almacenes : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetAllAlmacenes);
    }

    private Task<IEnumerable<AlmacenDto>> GetAllAlmacenes(ISender sender)
    {
        return sender.Send(new GetAllAlmacenesQuery());
    }
}