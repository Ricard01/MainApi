using Dapper;
using MainApi.Application.Common.Interfaces;

namespace MainApi.Application.CONTPAQi.Existencias.Queries;

public record GetExistenciayCostoQuery(int IdProducto) : IRequest<ExistenciaCostoDto>;

public class GetExistenciayCostoQueryHandler : IRequestHandler<GetExistenciayCostoQuery, ExistenciaCostoDto>
{
    private readonly IContpaqiSqlConnection _sqlConnection;

    public GetExistenciayCostoQueryHandler(IContpaqiSqlConnection sqlConnection)
    {
        _sqlConnection = sqlConnection;
    }

    public async Task<ExistenciaCostoDto> Handle(GetExistenciayCostoQuery request, CancellationToken cancellationToken)
    {
        var hoy = DateTime.Today.AddDays(1); // para evitar el problema que no traiga todos los registros por la hora

        await using var connection = await _sqlConnection.CreateAsync();
        
        const string query = """
                          SELECT 
                              ISNULL(SUM(CASE 
                                  WHEN cAfectaExistencia = 1 THEN cUnidades
                                  WHEN cAfectaExistencia = 2 THEN 0 - cUnidades 
                                  ELSE 0 
                              END), 0) AS Existencia
                          FROM admMovimientos 
                          WHERE cIdProducto = @IdProducto 
                            AND (cAfectadoInventario = 1 OR cAfectadoInventario = 2) 
                            AND cFecha <= @FechaHoy;
                        
                          SELECT TOP 1 
                              cCostoH CostoPromedio, 
                              cUltimoCostoH UltimoCosto
                          FROM admCostosHistoricos 
                          WHERE cIdProducto = @IdProducto 
                            AND cIdAlmacen = 0 
                            AND cFechaCostoH < @FechaHoy
                          ORDER BY cFechaCostoH DESC;
                          """;
        
        var commandDefinition = new CommandDefinition(
            query,
            new { IdProducto = request.IdProducto, FechaHoy = hoy },
            cancellationToken: cancellationToken
        );
        
        await using var multi = await connection.QueryMultipleAsync(commandDefinition);
        
        // 1. Leemos Unidades usando ReadFirstAsync porque un SUM ISNULL siempre devuelve 1 registro
        var existencia = await multi.ReadFirstAsync<double>();

        // 2. Leemos Costos. Usamos ReadFirstOrDefaultAsync porque podría no haber histórico
        var dtoResult = await multi.ReadFirstOrDefaultAsync<ExistenciaCostoDto>() ?? new ExistenciaCostoDto
        {
            CostoPromedio = 0.0,
            UltimoCosto = 0.0
        };
        
        dtoResult.Existencia = existencia; // existencia siempre devuelve un valor valido por el SUM por eso no se incluye arriba

        return dtoResult;
    }
}