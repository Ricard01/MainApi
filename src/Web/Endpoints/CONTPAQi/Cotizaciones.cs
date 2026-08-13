using MainApi.Application.CONTPAQi.Cotizaciones.Commands.CreateCotizacion;
using MainApi.Application.CONTPAQi.Cotizaciones.Commands.UpdateCotizacion;
using MainApi.Application.CONTPAQi.Cotizaciones.Commands.DeleteCotizacion;
using MainApi.Application.CONTPAQi.Cotizaciones.Queries;
using MainApi.Application.CONTPAQi.Cotizaciones.Queries.GetCotizacion;
using MainApi.Application.Common.Models;
using MainApi.Application.Common.Exceptions;
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
            .MapPut(UpdateCotizacion, "{id:int}")
            .MapDelete(DeleteCotizacion, "{id:int}")
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

    private Task<int> UpdateCotizacion(ISender sender, int id, UpdateCotizacionCommand command)
    {
        if (id != command.Id)
        {
            throw new ValidationException([
                new FluentValidation.Results.ValidationFailure(nameof(command.Id), "El ID no coincide con la ruta.")
            ]);
        }

        return sender.Send(command);
    }

    private async Task<IResult> DeleteCotizacion(ISender sender, int id)
    {
        await sender.Send(new DeleteCotizacionCommand(id));
        return Results.NoContent();
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
