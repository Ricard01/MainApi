using MainApi.Application.Common.Interfaces;
using MainApi.Application.CONTPAQi.Documentos;

namespace MainApi.Application.CONTPAQi.Cotizaciones.Commands.CreateCotizacion;

public record CreateCotizacionCommand : IRequest<int>
{
    // Este record representa el JSON que llega desde Angular para crear la cotizacion.
    // El handler regresa el CIDDOCUMENTO generado en CONTPAQi.
    public int Id { get; init; }
    public string Fecha { get; init; } = string.Empty;
    public string Serie { get; init; } = string.Empty;
    public int Folio { get; init; }
    public int IdAgente { get; init; }
    public bool IsPersonaMoral { get; init; }
    public string Cliente { get; init; } = string.Empty;
    public string Contacto { get; init; } = string.Empty;
    public string Email { get; init; } = string.Empty;
    public string Telefono { get; init; } = string.Empty;
    public string? Observaciones { get; init; } = null;
    public IReadOnlyCollection<ProductoCotizacionDto> Productos { get; init; } = Array.Empty<ProductoCotizacionDto>();
}

public record ProductoCotizacionDto
{
    public int IdProducto { get; init; }
    public int IdUnidadMedida { get; init; }
    public decimal Cantidad { get; init; }
    public decimal Precio { get; init; }
    public string? Observaciones { get; init; } = null;
    public decimal DescuentoPorcentaje { get; init; }
    public decimal Descuento { get; init; }
    public decimal Neto { get; init; }
    public decimal Iva { get; init; }
    public decimal Isr { get; init; }
    public decimal Total { get; init; }
}

public class CreateCotizacionCommandHandler : IRequestHandler<CreateCotizacionCommand, int>
{
    private readonly IContpaqiSqlConnection _sqlConnection;
    private readonly IDocumentoContpaqiService _documentoService;

    public CreateCotizacionCommandHandler(
        IContpaqiSqlConnection sqlConnection,
        IDocumentoContpaqiService documentoService)
    {
        _sqlConnection = sqlConnection;
        _documentoService = documentoService;
    }

    public async Task<int> Handle(CreateCotizacionCommand request, CancellationToken cancellationToken)
    {
        // 1. Abrimos la conexion a la empresa de CONTPAQi configurada.
        await using var connection = await _sqlConnection.CreateAsync();

        // 2. Todo lo que se inserte para la cotizacion debe quedar en una misma transaccion.
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        try
        {
            // 3. Convertimos el command de Angular a un request generico de documento CONTPAQi.
            var documento = CreateCotizacionMapper.ToDocumentoContpaqi(request);

            // 4. El servicio de infraestructura ejecuta los inserts reales en las tablas CONTPAQi.
            var idDocumento = await _documentoService.CrearAsync(connection, transaction, documento, cancellationToken);

            // 5. Si todo salio bien se confirma la transaccion y se regresa el CIDDOCUMENTO.
            await transaction.CommitAsync(cancellationToken);
            return idDocumento;
        }
        catch
        {
            // Si algo falla no dejamos el documento a medias en CONTPAQi.
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}