using MainApi.Application.CONTPAQi.Productos.Queries.GetAllProductos;
using MainApi.Application.CONTPAQi.Productos.Queries.GetUnidadesMedida;
using MainApi.Application.CONTPAQi.Productos.Queries.SearchProductos;

namespace MainApi.Web.Endpoints.CONTPAQi;

public class Productos : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetAllProducts)
            .MapGet(SearchProducts, "search")
            .MapGet(GetUnidadesMedida, "{productoId:int}/unidades-venta");
    }

    private Task<IEnumerable<ProductoItemDto>> SearchProducts([AsParameters] SearchProductosQuery query, ISender sender)
    {
        return sender.Send(query);
    }

    private Task<IEnumerable<ProductoItemDto>> GetAllProducts([AsParameters] GetAllProductosQuery query, ISender sender)
    {
        return sender.Send(query);
    }

    private Task<IEnumerable<UnidadMedidaDto>> GetUnidadesMedida(int productoId, ISender sender)
    {
        return sender.Send(new GetUnidadesMedidaProductoQuery() { ProductoId = productoId });
    }
}