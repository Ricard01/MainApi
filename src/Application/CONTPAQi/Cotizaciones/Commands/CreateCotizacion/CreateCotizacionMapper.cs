using System.Globalization;
using MainApi.Application.CONTPAQi.Documentos;

namespace MainApi.Application.CONTPAQi.Cotizaciones.Commands.CreateCotizacion;

public static class CreateCotizacionMapper
{
    public static CrearDocumentoContpaqiRequest ToDocumentoContpaqi(CreateCotizacionCommand request)
    {
        return new CrearDocumentoContpaqiRequest
        {
            Config = DocumentoContpaqiConfigs.Cotizacion,
            Fecha = ParseFecha(request.Fecha),
            Serie = request.Serie,
            Folio = request.Folio,
            IdCliente = request.IsPersonaMoral ? 338: 1,
            RazonSocial = request.IsPersonaMoral ? "Cotización Persona Moral": "Cotización Persona Fisica",
            TextoExtra1 = request.Cliente,
            TextoExtra2 = request.Email,
            TextoExtra3 = request.Telefono,
            IdAgente = request.IdAgente,
            Referencia = request.Contacto,
            Observaciones = request.Observaciones,
            Movimientos = request.Productos.Select(ToMovimientoContpaqi).ToArray()
        };
    }

    private static CrearMovimientoContpaqiRequest ToMovimientoContpaqi(ProductoCotizacionDto producto)
    {
        return new CrearMovimientoContpaqiRequest
        {
            IdProducto = producto.IdProducto,
            IdUnidad = producto.IdUnidadMedida,
            Cantidad = producto.Cantidad,
            Precio = producto.Precio,
            DescuentoPorcentaje = producto.DescuentoPorcentaje,
            Descuento = producto.Descuento,
            Iva = producto.Iva,
            Isr = producto.Isr,
            Observacion = producto.Observaciones
        };
    }

    private static DateTime ParseFecha(string fecha)
    {
        return DateTime.TryParseExact(fecha, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var result)
            ? result
            : DateTime.Today;
    }
}
