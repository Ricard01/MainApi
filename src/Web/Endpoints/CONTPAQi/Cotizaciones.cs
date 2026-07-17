using MainApi.Application.CONTPAQi.Cotizaciones.Commands.CreateCotizacion;
using MainApi.Application.CONTPAQi.Cotizaciones.Queries;

namespace MainApi.Web.Endpoints.CONTPAQi;

public class Cotizaciones : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapPost(CreateCotizacion)
            .MapGet("folio", GetFolio);
    }

    private Task<FolioCotizacion> GetFolio(ISender sender)
    {
        return sender.Send(new GetFolioCotizacionQuery());
    }
    
    private Task<int> CreateCotizacion(ISender sender, CreateCotizacionCommand command)
    {
        // Angular hace POST a este endpoint y ASP.NET llena el command con el JSON recibido.
        // Desde aqui ya no se ejecuta logica: se manda el command a MediatR para que lo atienda su handler.
        return sender.Send(command);
    }
}
