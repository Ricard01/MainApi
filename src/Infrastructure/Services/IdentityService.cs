using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Models;
using MainApi.Domain.Entities;
using Microsoft.EntityFrameworkCore;


namespace MainApi.Infrastructure.Services;

public class IdentityService : IIdentityService
{
    private readonly IAppDbContext _context;
    private readonly IPasswordService _passwordService;

    public IdentityService(IAppDbContext context, IPasswordService passwordService)
    {
        _context = context;
        _passwordService = passwordService;
    }

    public async Task<IdentityResult> CreateUserAsync(UserModel model, CancellationToken cancellationToken)
    {
        if (!await _context.Roles.AnyAsync(r => r.Id == model.IdRol, cancellationToken))
            return IdentityResult.Fail("El rol no existe.");


        var hash = _passwordService.Hash(model.Password);

        var user = User.Create(
            userName: model.UserName,
            nombre: model.Nombre,
            apellidoPaterno: model.ApellidoPaterno,
            apellidoMaterno: model.ApellidoMaterno,
            email: model.Email,
            telefono: model.Telefono,
            imagenPerfilUrl: model.ImagenPerfilUrl,
            passwordHash: hash,
            idRol: model.IdRol
        );

        _context.Usuarios.Add(user);
        await _context.SaveChangesAsync(cancellationToken);

        return IdentityResult.Ok();
    }
    
    public async Task<string?> GetUserNameAsync(string userId)
    {
        if (!Guid.TryParse(userId, out Guid userGuid))
        {
            return null;
        }

        var user = await _context.Usuarios.FindAsync(userGuid);
        return user?.UserName;
    }

    public async Task<IdentityResult> CreateRoleAsync(RolModel model, CancellationToken cancellationToken)
    {
        if (await _context.Roles.AnyAsync(r => r.Nombre == model.Nombre, cancellationToken))
            return IdentityResult.Fail("El rol ya existe.");

        var permisosValidos = await _context.Permisos
            .Where(p => model.PermisosIds.Contains(p.Id))
            .Select(p => p.Id)
            .ToListAsync(cancellationToken);

        var permisosInvalidos = model.PermisosIds
            .Except(permisosValidos)
            .ToList();

        if (permisosInvalidos.Count != 0)
            return IdentityResult.Fail($"Permisos inválidos: {string.Join(",", permisosInvalidos)}");

        var rol = new Rol 
        { 
            Nombre = model.Nombre, 
            Descripcion = model.Descripcion 
        };

        foreach (var idPermiso in permisosValidos)
        {
            rol.AsignarPermiso(idPermiso);
        }
        await _context.Roles.AddAsync(rol, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return IdentityResult.Ok();
    }

    public async Task<bool> RolExistsAsync(string name)
    {
        return await _context.Roles.AnyAsync(r => r.Nombre == name);
    }
    
}