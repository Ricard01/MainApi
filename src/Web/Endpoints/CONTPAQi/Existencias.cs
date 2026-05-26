using MainApi.Application.CONTPAQi.Existencias.Queries;

namespace MainApi.Web.Endpoints.CONTPAQi;

public class Existencias : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetExistenciaCostoAsync,"costo/{IdProducto}");
    }

    private Task<ExistenciaCostoDto> GetExistenciaCostoAsync(ISender sender, int idProducto)
    {
        return sender.Send(new GetExistenciayCostoQuery(idProducto));
    }
}