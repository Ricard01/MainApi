using Dapper;
using MainApi.Application.Common.Interfaces;

namespace MainApi.Application.CONTPAQi.Cotizaciones.Queries.GetCotizacion;

public sealed record GetCotizacionQuery(int Id) : IRequest<CotizacionDetailDto?>;

public sealed record CotizacionDetailDto
{
    public int Id { get; init; }
    public DateTime Fecha { get; init; }
    public string Serie { get; init; } = string.Empty;
    public decimal Folio { get; init; }
    public int IdAgente { get; init; }
    public string AgenteCodigo { get; init; } = string.Empty;
    public string AgenteNombre { get; init; } = string.Empty;
    public bool IsPersonaMoral { get; init; }
    public int IdCliente { get; init; }
    public string ClienteCodigo { get; init; } = string.Empty;
    public string ClienteRazonSocial { get; init; } = string.Empty;
    public string Cliente { get; init; } = string.Empty;
    public string Contacto { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Telefono { get; init; } = string.Empty;
    public string Observaciones { get; init; } = string.Empty;
    public string UsuarioNombre { get; init; } = string.Empty;
    public string Estado { get; init; } = string.Empty;
    public IReadOnlyCollection<CotizacionMovimientoDto> Productos { get; set; } = [];
}

public sealed record CotizacionMovimientoDto
{
    public int IdMovimiento { get; init; }
    public decimal Pendiente { get; init; }
    public int IdProducto { get; init; }
    public string Codigo { get; init; } = string.Empty;
    public string Producto { get; init; } = string.Empty;
    public string Observaciones { get; init; } = string.Empty;
    public decimal Cantidad { get; init; }
    public int IdUnidad { get; init; }
    public string Unidad { get; init; } = string.Empty;
    public decimal Precio { get; init; }
    public decimal DescuentoPorcentaje { get; init; }
    public decimal Descuento { get; init; }
    public decimal Neto { get; init; }
    public decimal Iva { get; init; }
    public decimal Isr { get; init; }
    public decimal Total { get; init; }
}

public sealed class GetCotizacionQueryHandler(IContpaqiSqlConnection sqlConnection)
    : IRequestHandler<GetCotizacionQuery, CotizacionDetailDto?>
{
    public async Task<CotizacionDetailDto?> Handle(
        GetCotizacionQuery request,
        CancellationToken cancellationToken)
    {
        const string sql = """
                           SELECT TOP 1
                                                         d.CIDDOCUMENTO AS Id,
                                                         d.CFECHA AS Fecha,
                                                         d.CSERIEDOCUMENTO AS Serie,
                                                         d.CFOLIO AS Folio,
                                                         d.CIDAGENTE AS IdAgente,
                                                         COALESCE(a.CCODIGOAGENTE, '') AS AgenteCodigo,
                                                         COALESCE(a.CNOMBREAGENTE, '') AS AgenteNombre,
                                                         CAST(CASE WHEN d.CIDCLIENTEPROVEEDOR = 338 THEN 1 ELSE 0 END AS bit) AS IsPersonaMoral,
                                                         d.CIDCLIENTEPROVEEDOR AS IdCliente,
                                                         COALESCE(c.CCODIGOCLIENTE, '') AS ClienteCodigo,
                                                         COALESCE(c.CRAZONSOCIAL, '') AS ClienteRazonSocial,
                                                         d.CTEXTOEXTRA1 AS Cliente,
                                                         d.CREFERENCIA AS Contacto,
                                                         d.CTEXTOEXTRA2 AS Email,
                                                         d.CTEXTOEXTRA3 AS Telefono,
                                                         COALESCE(d.COBSERVACIONES, '') AS Observaciones,
                                                         d.CDESTINATARIO AS UsuarioNombre,
                                                         CASE WHEN d.CUNIDADESPENDIENTES = 0 THEN 'facturada'
                                                              WHEN d.CUNIDADESPENDIENTES < d.CTOTALUNIDADES THEN 'parcial'
                                                              ELSE 'pendiente' END AS Estado
                                                     FROM admDocumentos d
                                                     LEFT JOIN admAgentes a ON a.CIDAGENTE = d.CIDAGENTE
                                                     LEFT JOIN admClientes c ON c.CIDCLIENTEPROVEEDOR = d.CIDCLIENTEPROVEEDOR
                                                     WHERE d.CIDDOCUMENTO = @Id 
                                                       AND d.CIDDOCUMENTODE = 1
                                                       AND d.CIDCONCEPTODOCUMENTO = 1;

                                                     SELECT
                                                         m.CIDMOVIMIENTO AS IdMovimiento,
                                                         m.CUNIDADESPENDIENTES AS Pendiente,
                                                         m.CIDPRODUCTO AS IdProducto,
                                                         COALESCE(p.CCODIGOPRODUCTO, '') AS Codigo,
                                                         COALESCE(p.CNOMBREPRODUCTO, '') AS Producto,
                                                         COALESCE(m.COBSERVAMOV, '') AS Observaciones,
                                                         m.CUNIDADES AS Cantidad,
                                                         m.CIDUNIDAD AS IdUnidad,
                                                         COALESCE(NULLIF(u.CABREVIATURA, ''), u.CNOMBREUNIDAD, '') AS Unidad,
                                                         m.CPRECIO AS Precio,
                                                         m.CPORCENTAJEDESCUENTO1 AS DescuentoPorcentaje,
                                                         m.CDESCUENTO1 AS Descuento,
                                                         m.CNETO AS Neto,
                                                         m.CIMPUESTO1 AS Iva,
                                                         m.CRETENCION1 AS Isr,
                                                         m.CTOTAL AS Total
                                                     FROM admMovimientos m
                                                     LEFT JOIN admDocumentos d ON d.CIDDOCUMENTO=m.CIDDOCUMENTO
                                                     LEFT JOIN admProductos p ON p.CIDPRODUCTO = m.CIDPRODUCTO
                                                     LEFT JOIN admUnidadesMedidaPeso u ON u.CIDUNIDAD = m.CIDUNIDAD
                                                     WHERE d.CIDDOCUMENTO = @Id 
                                                     ORDER BY m.CNUMEROMOVIMIENTO, m.CIDMOVIMIENTO;
                           """;

        await using var connection = await sqlConnection.CreateAsync();
        using var result = await connection.QueryMultipleAsync(new CommandDefinition(
            sql,
            new { request.Id },
            cancellationToken: cancellationToken));

        var cotizacion = await result.ReadSingleOrDefaultAsync<CotizacionDetailDto>();
        if (cotizacion is null) return null;

        cotizacion.Productos = (await result.ReadAsync<CotizacionMovimientoDto>()).AsList();
        return cotizacion;
    }
}