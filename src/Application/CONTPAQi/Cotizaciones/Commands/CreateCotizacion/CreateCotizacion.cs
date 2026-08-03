using System.Data.Common;
using MainApi.Application.Common.Interfaces;
using Microsoft.Data.SqlClient;

namespace MainApi.Application.CONTPAQi.Cotizaciones.Commands.CreateCotizacion;

public record CreateCotizacionCommand : IRequest<int>
{
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
    public IReadOnlyCollection<CreateCotizacionMovto> Productos { get; init; } = Array.Empty<CreateCotizacionMovto>();
}

public record CreateCotizacionMovto
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

/// <summary>
/// Guarda la cotización completa en una sola transacción.
/// Si Comercial gana el mismo ID o SQL Server detecta un deadlock, vuelve a intentar desde cero.
/// </summary>
public class CreateCotizacionCommandHandler : IRequestHandler<CreateCotizacionCommand, int>
{
    private const int MaximoIntentos = 3;
    private static readonly HashSet<int> ErroresReintentables = [1205, 2601, 2627];

    private readonly IContpaqiSqlConnection _sqlConnection;
    private readonly IDocumentoContpaqiService _documentoService;
    private readonly IUser _currentUser;

    public CreateCotizacionCommandHandler(
        IContpaqiSqlConnection sqlConnection,
        IDocumentoContpaqiService documentoService,
        IUser currentUser)
    {
        _sqlConnection = sqlConnection;
        _documentoService = documentoService;
        _currentUser = currentUser;
    }

    public async Task<int> Handle(CreateCotizacionCommand request, CancellationToken cancellationToken)
    {
        for (var intento = 1; intento <= MaximoIntentos; intento++)
        {

            await using var connection = await _sqlConnection.CreateAsync();
            await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

            try
            {
                var documento = CreateCotizacionMapper.ToDocumentoContpaqi(
                    request,
                    _currentUser.Nombre ?? string.Empty);
                var idDocumento = await _documentoService.CrearAsync(
                    connection,
                    transaction,
                    documento,
                    cancellationToken);

                await transaction.CommitAsync(cancellationToken);
                return idDocumento;
            }
            catch (SqlException exception)
                when (EsErrorReintentable(exception) && intento < MaximoIntentos)
            {
                await RollbackSeguroAsync(transaction, cancellationToken);

                // Una pausa corta evita que las mismas dos operaciones vuelvan a chocar enseguida.
                await Task.Delay(TimeSpan.FromMilliseconds(50 * intento), cancellationToken);
            }
            catch
            {
                await RollbackSeguroAsync(transaction, cancellationToken);
                throw;
            }
        }

        // El ciclo siempre regresa o lanza la excepción del último intento.
        throw new InvalidOperationException("No fue posible terminar la creación de la cotización.");
    }

    private static bool EsErrorReintentable(SqlException exception)
    {
        // 1205: deadlock. 2601 y 2627: llave o índice duplicado.
        return exception.Errors
            .Cast<SqlError>()
            .Any(error => ErroresReintentables.Contains(error.Number));
    }

    private static async Task RollbackSeguroAsync(
        DbTransaction transaction,
        CancellationToken cancellationToken)
    {
        try
        {
            await transaction.RollbackAsync(cancellationToken);
        }
        catch (InvalidOperationException)
        {
            // En un deadlock SQL Server puede haber revertido la transacción antes que nosotros.
        }
    }
}
