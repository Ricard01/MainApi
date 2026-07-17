using System.Globalization;

namespace MainApi.Application.CONTPAQi.Documentos;

public static class DocumentoContpaqiMapper
{
    public static DocumentoResumen CalcularResumen(IEnumerable<admMovimientoRow> movimientos)
    {
        // El backend recalcula los importes para no confiar ciegamente en los totales de Angular.
        var items = movimientos.ToArray();

        return new DocumentoResumen(
            Neto: Round(items.Sum(x => x.CNETO)),
            Descuento: Round(items.Sum(x => x.CDESCUENTO1)),
            Iva: Round(items.Sum(x => x.CIMPUESTO1)),
            Isr: Round(items.Sum(x => x.CRETENCION1)),
            Total: Round(items.Sum(x => x.CTOTAL)),
            TotalUnidades: Round(items.Sum(x => x.CUNIDADES))
        );
    }

    public static admDocumentosRow ToDocumento(
        CrearDocumentoContpaqiRequest request,
        int idDocumento,
        DocumentoResumen resumen)
    {
        // Forma la fila parcial de admDocumentos con los datos ya traducidos a campos CONTPAQi.
        return new admDocumentosRow
        {
            CIDDOCUMENTO = idDocumento,
            CIDDOCUMENTODE = request.Config.TipoDocumento,
            CIDCONCEPTODOCUMENTO = request.Config.ConceptoDocumento,
            CSERIEDOCUMENTO = request.Serie,
            CFOLIO = request.Folio,
            CFECHA = request.Fecha,
            CIDCLIENTEPROVEEDOR = request.IdCliente,
            CRAZONSOCIAL = request.RazonSocial,
            CRFC = request.Rfc,
            CIDAGENTE = request.IdAgente,
            CREFERENCIA = request.Referencia,
            CFECHAVENCIMIENTO = request.Fecha,
            CFECHAPRONTOPAGO = request.Fecha,
            CFECHAENTREGARECEPCION = request.Fecha,
            CFECHAULTIMOINTERES = request.Fecha,
            CIDMONEDA = request.Config.Moneda,
            CTIPOCAMBIO = request.Config.TipoCambio,
            COBSERVACIONES = request.Observaciones,
            CNATURALEZA = request.Config.Naturaleza,
            CUSACLIENTE = request.Config.UsaCliente,
            CAFECTADO = request.Config.Afectado,
            CIMPRESO = request.Config.Impreso,
            CCANCELADO = request.Config.Cancelado,
            CESTADOCONTABLE = request.Config.EstadoContable,
            CNETO = resumen.Neto,
            CIMPUESTO1 = resumen.Iva,
            CRETENCION1 = resumen.Isr,
            CDESCUENTOMOV = resumen.Descuento,
            CTOTAL = resumen.Total,
            CPENDIENTE = resumen.Total,
            CTOTALUNIDADES = resumen.TotalUnidades,
            CTEXTOEXTRA1 = request.TextoExtra1,
            CTEXTOEXTRA2 = request.TextoExtra2,
            CTEXTOEXTRA3 = request.TextoExtra3,
            CDESTINATARIO = request.RazonSocial,
            CBANOBSERVACIONES = string.IsNullOrWhiteSpace(request.Observaciones) ? 0 : 1,
            CTIMESTAMP = CrearTimestampContpaqi(),
            CUNIDADESPENDIENTES = resumen.TotalUnidades,
            CIMPCHEQPAQ = resumen.Total,
            CGUIDDOCUMENTO = Guid.NewGuid().ToString(),
            CUSUARIO = request.Config.Usuario,
            CSISTORIG = request.Config.SistemaOrigen
        };
    }

    public static IReadOnlyCollection<admMovimientoRow> ToMovimientos(
        CrearDocumentoContpaqiRequest request,
        int idDocumento,
        int idMovimientoInicial)
    {
        // Prepara los movimientos y asigna CNUMEROMOVIMIENTO consecutivo por renglon.
        return request.Movimientos
            .Select((movimiento, index) =>
                ToMovimiento(request, movimiento, idDocumento, idMovimientoInicial + index, index + 1))
            .ToArray();
    }

    private static admMovimientoRow ToMovimiento(
        CrearDocumentoContpaqiRequest request,
        CrearMovimientoContpaqiRequest movimiento,
        int idDocumento,
        int idMovimiento,
        int numeroMovimiento)
    {
        // CONTPAQi guarda float, pero calculamos con decimal y redondeamos antes de persistir.
        var neto = Round(movimiento.Cantidad * movimiento.Precio);
        var baseImpuesto = Math.Max(neto - movimiento.Descuento, 0);
        var iva = Round(movimiento.Iva > 0 ? movimiento.Iva : baseImpuesto * 0.16m);
        var isr = Round(movimiento.Isr);
        var total = Round(baseImpuesto + iva - isr);

        return new admMovimientoRow
        {
            CIDMOVIMIENTO = idMovimiento,
            CIDDOCUMENTO = idDocumento,
            CNUMEROMOVIMIENTO = numeroMovimiento,
            CIDDOCUMENTODE = request.Config.TipoDocumento,
            CIDPRODUCTO = movimiento.IdProducto,
            CIDALMACEN = request.Config.AlmacenDefault,
            CUNIDADES = movimiento.Cantidad,
            CIDUNIDAD = movimiento.IdUnidad,
            CPRECIO = movimiento.Precio,
            CNETO = neto,
            CDESCUENTO1 = Round(movimiento.Descuento),
            CPORCENTAJEDESCUENTO1 = movimiento.DescuentoPorcentaje,
            CIMPUESTO1 = iva,
            CPORCENTAJEIMPUESTO1 = iva > 0 ? 16m : 0m,
            CRETENCION1 = isr,
            CPORCENTAJERETENCION1 = isr > 0 ? 1.25m : 0m,
            CTOTAL = total,
            COBSERVAMOV = movimiento.Observacion,
            CFECHA = request.Fecha
        };
    }

    public static decimal Round(decimal value)
    {
        return Math.Round(value, 2, MidpointRounding.AwayFromZero);
    }

    private static string CrearTimestampContpaqi()
    {
        return DateTime.Now.ToString("MM/dd/yyyy HH:mm:ss:fff", CultureInfo.InvariantCulture);
    }
}