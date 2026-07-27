using System.Globalization;
using MainApi.Application.CONTPAQi.Documentos;

namespace MainApi.Application.CONTPAQi.Cotizaciones.Commands.CreateCotizacion;

public static class CreateCotizacionMapper
{
    public static CrearDocumentoContpaqiRequest ToDocumentoContpaqi(CreateCotizacionCommand request)
    {
        var razonSocial = request.IsPersonaMoral
            ? "Cotización Persona Moral"
            : "Cotización Persona Fisica";

        return new CrearDocumentoContpaqiRequest
        {
            Config = TipoDocumentoContpaqi.Cotizacion,
            Fecha = ParseFecha(request.Fecha),
            Serie = request.Serie.Trim(),
            Folio = request.Folio,
            IdCliente = request.IsPersonaMoral ? 338: 1,
            RazonSocial = razonSocial,
            Rfc = string.Empty,
            TextoExtra1 = request.Cliente,
            TextoExtra2 = request.Email,
            TextoExtra3 = request.Telefono,
            IdAgente = request.IdAgente,
            Referencia = request.Contacto,
            Observaciones = request.Observaciones,
            Movimientos = request.Productos.Select(ToMovimientoContpaqi).ToArray()
        };
    }

    private static CrearMovimientoContpaqiRequest ToMovimientoContpaqi(CreateCotizacionMovto create)
    {
        return new CrearMovimientoContpaqiRequest
        {
            IdProducto = create.IdProducto,
            IdUnidad = create.IdUnidadMedida,
            Cantidad = create.Cantidad,
            Precio = create.Precio,
            DescuentoPorcentaje = create.DescuentoPorcentaje,
            Descuento = create.Descuento,
            Iva = create.Iva,
            Isr = create.Isr,
            Observacion = create.Observaciones,
            UnidadesPendientes = create.Cantidad
        };
    }

    private static DateTime ParseFecha(string fecha)
    {
        return DateTime.TryParseExact(fecha, "dd/MM/yyyy", CultureInfo.InvariantCulture, DateTimeStyles.None, out var result)
            ? result
            : DateTime.Today;
    }
}
