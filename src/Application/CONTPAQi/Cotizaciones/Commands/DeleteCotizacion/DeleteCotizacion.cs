using MainApi.Application.Common.Exceptions;
using MainApi.Application.Common.Interfaces;

namespace MainApi.Application.CONTPAQi.Cotizaciones.Commands.DeleteCotizacion;

public sealed record DeleteCotizacionCommand(int Id) : IRequest;

public sealed class DeleteCotizacionCommandHandler(
    IContpaqiSqlConnection sqlConnection,
    IDocumentoContpaqiService documentoService)
    : IRequestHandler<DeleteCotizacionCommand>
{
    public async Task Handle(DeleteCotizacionCommand request, CancellationToken cancellationToken)
    {
        await using var connection = await sqlConnection.CreateAsync();
        await using var transaction = await connection.BeginTransactionAsync(cancellationToken);

        try
        {
            var result = await documentoService.EliminarAsync(
                connection, transaction, request.Id, cancellationToken);

            switch (result)
            {
                case DocumentoMutationResult.NotFound:
                    throw new KeyNotFoundException($"No existe la cotización {request.Id}.");
                case DocumentoMutationResult.Facturada:
                    throw new ConflictException("No se puede eliminar una cotización facturada.");
            }

            await transaction.CommitAsync(cancellationToken);
        }
        catch
        {
            await transaction.RollbackAsync(cancellationToken);
            throw;
        }
    }
}
