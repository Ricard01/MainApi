using MainApi.Application.Common.Models;
using MainApi.Application.CONTPAQi.Documentos.Queries.GetDocumentos;
using MainApi.Application.CONTPAQi.Facturas.Queries.GetFacturas;
using MainApi.Domain.Enums;

namespace MainApi.Web.Endpoints.CONTPAQi;

public class Facturas: EndpointGroupBase
{

    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetFacturas);
    }
    private Task<PaginatedList<FacturaListItem>> GetFacturas(
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
        return sender.Send(new GetFacturasQuery()
        {
            TipoDocumento = TipoDocumento.Factura,
            ConceptoDocumento = 5,
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
}