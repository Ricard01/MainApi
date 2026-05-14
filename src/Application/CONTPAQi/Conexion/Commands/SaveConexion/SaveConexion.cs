using MainApi.Application.Common.Interfaces;
using MainApi.Domain.Entities;

namespace MainApi.Application.CONTPAQi.Conexion.Commands.SaveConexion;

public record SaveConexionCommand : IRequest<int>
{
    public required string Servidor { get; init; }
    public required string BaseDatos { get; init; }
    public required string SqlUser { get; init; }
    public string? Password { get; init; }
    public int Puerto { get; init; } = 1433;
}

public class SaveConexionHandler : IRequestHandler<SaveConexionCommand, int>
{
    private readonly IAppDbContext _context;
    private readonly IEncryptionService _encryptionService;

    public SaveConexionHandler(IAppDbContext context, IEncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    public async Task<int> Handle(SaveConexionCommand request, CancellationToken cancellationToken)
    {
        var conexion = await _context.ContpaqiConexion.FirstOrDefaultAsync(cancellationToken);

        if (conexion is null)
        {
            var entidad = new ContpaqiConexion
            {
                Servidor = request.Servidor,
                BaseDatos = request.BaseDatos,
                SqlUser = request.SqlUser,
                PasswordEncrypted = _encryptionService.Encrypt(request.Password!),
                Puerto = request.Puerto
            };

            _context.ContpaqiConexion.Add(entidad);
            await _context.SaveChangesAsync(cancellationToken);

            return entidad.Id;
        }

        conexion.Servidor = request.Servidor;
        conexion.BaseDatos = request.BaseDatos;
        conexion.SqlUser = request.SqlUser;
        conexion.Puerto = request.Puerto;

        if (!string.IsNullOrWhiteSpace(request.Password))
        {
            conexion.PasswordEncrypted = _encryptionService.Encrypt(request.Password);
        }

        await _context.SaveChangesAsync(cancellationToken);

        return conexion.Id;
    }
}