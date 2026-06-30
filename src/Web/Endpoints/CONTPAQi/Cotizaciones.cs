using MainApi.Application.CONTPAQi.Cotizaciones.Queries;

namespace MainApi.Web.Endpoints.CONTPAQi;

public class Cotizaciones : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet("folio", GetFolio);
    }

    private Task<FolioCotizacion> GetFolio(ISender sender)
    {
        return sender.Send(new GetFolioCotizacionQuery());
    }
}