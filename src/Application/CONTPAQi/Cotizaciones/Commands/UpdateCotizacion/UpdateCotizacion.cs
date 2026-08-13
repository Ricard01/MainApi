using MainApi.Application.Common.Exceptions;
using MainApi.Application.Common.Interfaces;
using MainApi.Application.CONTPAQi.Cotizaciones.Commands.CreateCotizacion;

namespace MainApi.Application.CONTPAQi.Cotizaciones.Commands.UpdateCotizacion;

public sealed record UpdateCotizacionCommand : IRequest<int>
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
    public string? Observaciones { get; init; }
    public IReadOnlyCollection<CreateCotizacionMovto> Productos { get; init; } = [];
}

public sealed class UpdateCotizacionCommandHandler(
    IContpaqiSqlConnection sqlConnection,
    IDocumentoContpaqiService documentoService,
    IUser currentUser)
    : IRequestHandler<UpdateCotizacionCommand, int>
{
    public async Task<int> Handle(UpdateCotizacionCommand request, CancellationToken cancellationToken)
    {
        await using var connection = await sqlConnection.CreateAsync();
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        try
        {
            var documento = CreateCotizacionMapper.ToDocumentoContpaqi(request, currentUser.Nombre ?? string.Empty);
            var result = await documentoService.ActualizarAsync(
                connection, transaction, request.Id, documento, cancellationToken);

            switch (result)
            {
                case DocumentoMutationResult.NotFound:
                    throw new KeyNotFoundException($"No existe la cotización {request.Id}.");
                case DocumentoMutationResult.Facturada:
                    throw new ConflictException("La cotización ya fue facturada y sólo puede consultarse.");
            }

            await transaction.CommitAsync(cancellationToken);
            return request.Id;
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
