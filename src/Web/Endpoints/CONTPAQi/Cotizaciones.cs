using MainApi.Application.CONTPAQi.Cotizaciones.Commands.CreateCotizacion;
using MainApi.Application.CONTPAQi.Cotizaciones.Queries;
using MainApi.Application.CONTPAQi.Cotizaciones.Queries.GetCotizacion;
using MainApi.Application.Common.Models;
using MainApi.Application.CONTPAQi.Documentos.Queries.GetDocumentos;
using MainApi.Domain.Enums;

namespace MainApi.Web.Endpoints.CONTPAQi;

public class Cotizaciones : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .RequireAuthorization()
            .MapPost(CreateCotizacion)
            .MapGet(GetCotizaciones)
            .MapGet(GetCotizacion, "{id:int}")
            .MapGet("folio", GetFolio);
    }

    private Task<FolioCotizacion> GetFolio(ISender sender)
    {
        return sender.Send(new GetFolioCotizacionQuery());
    }
    
    private Task<int> CreateCotizacion(ISender sender, CreateCotizacionCommand command)
    {
        return sender.Send(command);
    }

    private Task<PaginatedList<DocumentoListItem>> GetCotizaciones(
        ISender sender,
        int page = 1,
        int pageSize = 25,
        string? search = null,
        string sortBy = "fecha",
        string sortDirection = "desc",
        DateTime? dateFrom = null,
        DateTime? dateTo = null,
        string? status = null)
    {
        return sender.Send(new GetDocumentosQuery
        {
            TipoDocumento = TipoDocumento.Cotizacion,
            ConceptoDocumento = 1,
            Page = page,
            PageSize = pageSize,
            Search = search,
            SortBy = sortBy,
            SortDirection = sortDirection,
            DateFrom = dateFrom,
            DateTo = dateTo,
            Status = status
        });
    }

    private async Task<IResult> GetCotizacion(ISender sender, int id)
    {
        var cotizacion = await sender.Send(new GetCotizacionQuery(id));
        return cotizacion is null ? Results.NotFound() : Results.Ok(cotizacion);
    }
}
