using Dapper;
using MainApi.Application.Common.Interfaces;

namespace MainApi.Application.CONTPAQi.Cotizaciones.Queries;

public record GetFolioCotizacionQuery : IRequest<FolioCotizacion>;

public class GetFolioCotizacionQueryHandler : IRequestHandler<GetFolioCotizacionQuery, FolioCotizacion>
{
    private readonly IContpaqiSqlConnection _sqlConnection;

    public GetFolioCotizacionQueryHandler(IContpaqiSqlConnection sqlConnection)
    {
        _sqlConnection = sqlConnection;
    }

    public async Task<FolioCotizacion> Handle(GetFolioCotizacionQuery request, CancellationToken cancellationToken)
    {
        await using var connection = await _sqlConnection.CreateAsync();

        const string query = $"""
                        SELECT CSERIEPOROMISION Serie, 
                               CNOFOLIO Folio
                        FROM admConceptos
                        where CIDCONCEPTODOCUMENTO=1 -- Cotizacion 
                        """;
        
        return await connection.QuerySingleAsync<FolioCotizacion>(query);
    }
    
}