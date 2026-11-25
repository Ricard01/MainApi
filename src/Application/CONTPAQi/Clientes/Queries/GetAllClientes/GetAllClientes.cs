using Dapper;
using MainApi.Application.Common.Interfaces;
// ReSharper disable All

namespace MainApi.Application.CONTPAQi.Clientes.Queries.GetAllClientes;

/// <summary>
/// Obtiene el catálogo de clientes activos.
/// </summary>
/// <remarks>
/// Filtra únicamente registros activos (<c>cestatus = 1</c>) cuyo tipo corresponda a 
/// Cliente (<c>1</c>) o Cliente/Proveedor (<c>2</c>), excluyendo proveedores (<c>3</c>).
/// </remarks>
public class GetAllClientesQuery : IRequest<IEnumerable<ClienteDto>>
{
}

public class GetAllClientesQueryHandler : IRequestHandler<GetAllClientesQuery, IEnumerable<ClienteDto>>
{
    private readonly IContpaqiSqlConnection _sqlConnection;

    public GetAllClientesQueryHandler(IContpaqiSqlConnection sqlConnection)
    {
        _sqlConnection = sqlConnection;
    }

    public async Task<IEnumerable<ClienteDto>> Handle(GetAllClientesQuery request, CancellationToken cancellationToken)
    {
        await using var connection = await _sqlConnection.CreateAsync();

        const string query = """
                             SELECT cidclienteproveedor Id, 
                                    ccodigocliente Codigo, 
                                    crazonsocial RazonSocial 
                             FROM AdmClientes
                             WHERE ctipocliente in (1,2) and cestatus=1
                             """;

        return await connection.QueryAsync<ClienteDto>(query);
    }
}