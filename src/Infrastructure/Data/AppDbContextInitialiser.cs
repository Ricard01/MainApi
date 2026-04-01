using System.Reflection;
using MainApi.Application.Common.Interfaces;
using MainApi.Domain.Constants;
using MainApi.Domain.Entities;
using Microsoft.AspNetCore.Builder;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;

namespace MainApi.Infrastructure.Data;

public static class InitialiserExtensions
{
    public static async Task InitialiseDatabaseAsync(this WebApplication app)
    {
        using var scope = app.Services.CreateScope();
        var initialiser = scope.ServiceProvider.GetRequiredService<AppDbContextInitialiser>();

        await initialiser.InitialiseAsync();
        await initialiser.SeedAsync();
    }
}

public class AppDbContextInitialiser
{
    private readonly ILogger<AppDbContextInitialiser> _logger;
    private readonly AppDbContext _context;
    private readonly IPasswordService _passwordService;

    public AppDbContextInitialiser(ILogger<AppDbContextInitialiser> logger, AppDbContext context,
        IPasswordService passwordService)
    {
        _logger = logger;
        _context = context;
        _passwordService = passwordService;
    }

    public async Task InitialiseAsync()
    {
        try
        {
            _logger.LogInformation("Iniciailizando Base de Datos");
            await _context.Database.MigrateAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "Un error ocurrio durante la inicializacion de la base de datos");
            throw;
        }
    }

    public async Task SeedAsync()
    {
        try
        {
            _logger.LogInformation("Seeding default data...");
            await TrySeedAsync();
        }
        catch (Exception ex)
        {
            _logger.LogError(ex, "An error occurred while seeding the database");
            throw;
        }
    }

    private async Task TrySeedAsync()
    {
        const string Administrador = nameof(Administrador);
        const string Admin = nameof(Admin);

        await using var trx = await _context.Database.BeginTransactionAsync();

        try
        {
            // 1. Creacion empresa 
            var empresa = await _context.Empresa.FirstOrDefaultAsync();
            if (empresa == null)
            {
                empresa = new Empresa { Nombre = "Mi Empresa" };
                await _context.Empresa.AddAsync(empresa);
                await _context.SaveChangesAsync();
            }

            // 2. Permisos 
            var permisosDelCodigo = ObtenerPermisosDesdeClase();
            foreach (var perm in permisosDelCodigo)
            {
                if (!await _context.Permisos.AnyAsync(p => p.Nombre == perm.Nombre))
                {
                    await _context.Permisos.AddAsync(new Permiso
                    {
                        Nombre = perm.Nombre, Modulo = perm.Modulo, Descripcion = $"Acceso a {perm.Nombre}"
                    });
                }
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation($"Se Agregaron los Permisos con Exito.");

            // 3. Rol de Administrador
            var adminRol = await _context.Roles
                .Include(r => r.PermisosRol)
                .FirstOrDefaultAsync(r => r.Nombre == Administrador);

            if (adminRol is null)
            {
                adminRol = new Rol
                {
                    Nombre = Administrador, Descripcion = "Administrador tiene control total del sistema."
                };
                await _context.Roles.AddAsync(adminRol);
                await _context.SaveChangesAsync();
            }

            // 4. Asignar los permisos al Rol 

            var todosLosPermisosIds = await _context.Permisos.Select(p => p.Id).ToListAsync();

            foreach (var permisoId in todosLosPermisosIds)
            {
                adminRol.AsignarPermiso(permisoId);
            }

            await _context.SaveChangesAsync();
            _logger.LogInformation($"Se creo el Rol Administrador.");

            // 5. Usuario Admin
            if (!await _context.Usuarios.AnyAsync(u => u.UserName == Admin))
            {
                var hash = _passwordService.Hash("Nolose99!");

                var adminUser = User.Create(
                    userName: Admin,
                    nombre: "Ricardo",
                    apellidoPaterno: "Chavez",
                    apellidoMaterno: "Medina",
                    email: "rickardo.chavez@gmail.com",
                    telefono: "9981093639",
                    imagenPerfilUrl: "https://avatars.githubusercontent.com/u/20118398?v=4",
                    passwordHash: hash,
                    idRol: adminRol.Id
                );

                await _context.Usuarios.AddAsync(adminUser);
                await _context.SaveChangesAsync();
                _logger.LogInformation("Se creo el Usuario Admin con Exito");
            }

            await trx.CommitAsync();
        }
        catch (Exception)
        {
            await trx.RollbackAsync();
            throw;
        }
    }


    private record PermisoDto(string Nombre, string Modulo);

    private static List<PermisoDto> ObtenerPermisosDesdeClase()
    {
        var lista = new List<PermisoDto>();


        var modulos = typeof(Permisos).GetNestedTypes(BindingFlags.Public | BindingFlags.NonPublic);

        foreach (var modulo in modulos)
        {
            var campos =
                modulo.GetFields(BindingFlags.Public | BindingFlags.Static | BindingFlags.FlattenHierarchy);

            foreach (var campo in campos)
            {
                if (campo.IsLiteral && !campo.IsInitOnly)
                {
                    var valorConstante = campo.GetValue(null)?.ToString();

                    if (!string.IsNullOrWhiteSpace(valorConstante))
                    {
                        lista.Add(new PermisoDto(valorConstante, modulo.Name));
                    }
                }
            }
        }

        return lista;
    }
}