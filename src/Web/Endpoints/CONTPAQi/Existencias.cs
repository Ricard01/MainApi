using MainApi.Application.CONTPAQi.Existencias.Queries;
using Microsoft.AspNetCore.Mvc;

namespace MainApi.Web.Endpoints.CONTPAQi;

public class Existencias : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetExistenciaCostoAsync,"producto/{IdProducto}/costo");
    }

    private Task<ExistenciaCostoDto> GetExistenciaCostoAsync(ISender sender,[FromRoute]  int idProducto, [FromQuery] int idAlmacen)
    {
        return sender.Send(new GetExistenciayCostoQuery( idProducto, idAlmacen));
    }
}