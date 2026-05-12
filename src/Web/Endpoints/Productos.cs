using MainApi.Application.CONTPAQi.Productos.Queries.GetAllProductos;

namespace MainApi.Web.Endpoints;

public class Productos : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        app.MapGroup(this)
            .MapGet(GetAllProducts);
    }
    
    private Task<IEnumerable<ProductoItemDto>> GetAllProducts(ISender sender)
    {
        return sender.Send(new GetAllProductosQuery());
    }
    
}