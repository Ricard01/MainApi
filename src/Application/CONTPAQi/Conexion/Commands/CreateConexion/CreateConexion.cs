using MainApi.Application.Common.Interfaces;
using MainApi.Domain.Entities;

namespace MainApi.Application.CONTPAQi.Conexion.Commands.CreateConexion;

public record CreateConexionCommand : IRequest<int>
{
    public required string Servidor { get; init; }
    public required string BaseDatos { get; init; }
    public required string SqlUser { get; init; }
    public required string Password { get; init; }
    public int Puerto { get; init; } = 1433;
}

public class CreateConexionHandler : IRequestHandler<CreateConexionCommand, int>
{
    private readonly IAppDbContext _context;
    private readonly IEncryptionService _encryptionService;

    public CreateConexionHandler(IAppDbContext context, IEncryptionService encryptionService)
    {
        _context = context;
        _encryptionService = encryptionService;
    }

    public async Task<int> Handle(CreateConexionCommand request, CancellationToken cancellationToken)
    {
        var passwordEncriptada = _encryptionService.Encrypt(request.Password);
        
        var entidad = new ContpaqiConexion
        {
            Servidor = request.Servidor,
            BaseDatos = request.BaseDatos,
            SqlUser = request.SqlUser,
            PasswordEncrypted = passwordEncriptada,
            Puerto = request.Puerto
        };
        
        _context.ContpaqiConexion.Add(entidad);
        await _context.SaveChangesAsync(cancellationToken);

        return entidad.Id;
        
    }
}