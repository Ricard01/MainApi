using MainApi.Application.Common.Interfaces;

namespace MainApi.Application.CONTPAQi.Conexion.Queries.GetConexion;

public record GetConexionQuery : IRequest<ConexionContpaqiDto?>;

public class GetConexionQueryHandler : IRequestHandler<GetConexionQuery, ConexionContpaqiDto?>
{
    private readonly IAppDbContext _context;

    public GetConexionQueryHandler(IAppDbContext context)
    {
        _context = context;
    }

    public async Task<ConexionContpaqiDto?> Handle(GetConexionQuery request, CancellationToken cancellationToken)
    {
        var conexion = await _context.ContpaqiConexion.AsNoTracking()
            .Select(x => new ConexionContpaqiDto
            {
                Servidor = x.Servidor,
                BaseDatos = x.BaseDatos,
                SqlUser = x.SqlUser,
                Puerto = x.Puerto
            }).FirstOrDefaultAsync(cancellationToken);

        if (conexion is null)
        {
            return null;
        }

        return conexion;
    }
}