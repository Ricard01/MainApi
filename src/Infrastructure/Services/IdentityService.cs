using System.Security.Claims;
using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Models;
using MainApi.Application.Features.Auth.Commands.Login;
using MainApi.Domain.Constants;
using MainApi.Domain.Entities;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authentication.Cookies;
using Microsoft.AspNetCore.Http;
using Microsoft.EntityFrameworkCore;


namespace MainApi.Infrastructure.Services;

public class IdentityService : IIdentityService
{
    private readonly IAppDbContext _context;
    private readonly IPasswordService _passwordService;
    private readonly IHttpContextAccessor _http;

    public IdentityService(IAppDbContext context, IPasswordService passwordService, IHttpContextAccessor http)
    {
        _context = context;
        _passwordService = passwordService;
        _http = http;
    }

    public async Task<AuthUser> SignInAsync(string username, string password, bool rememberMe,
        CancellationToken cancellationToken)
    {
        // 1) Carga del usuario, su rol y los permisos asociados EN UNA SOLA CONSULTA
        var user = await _context.Usuarios
            .Include(u => u.Rol)
            .ThenInclude(r => r.PermisosRol)
            .ThenInclude(rp => rp.Permiso)
            .FirstOrDefaultAsync(u => u.UserName == username, cancellationToken);

        if (user is null)
            throw new UnauthorizedAccessException("Usuario o contraseña inválidos.");

        // 2) Verificación + posible rehash
        var result = _passwordService.Verify(user.PasswordHash, password, out var needsRehash);
        if (!result) throw new UnauthorizedAccessException("Usuario o contraseña inválidos.");

        if (needsRehash)
        {
            user.SetPasswordHash(_passwordService.Hash(password)); // método de dominio
            await _context.SaveChangesAsync(cancellationToken);
        }

        // 3) Extracción de permisos en memoria (no mas querys a BDS)
        var nombresPermisos = user.Rol.PermisosRol
            .Select(rp => rp.Permiso.Nombre)
            .ToList();

        //  4) Crea la lista de claims
        var claims = new List<Claim>
        {
            new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
            new Claim(ClaimTypes.Name, user.Nombre),
            new Claim(ClaimConstants.ImagenUrl, user.ImagenPerfilUrl ?? string.Empty),
            new(ClaimTypes.Role, user.Rol.Nombre),
        };

        foreach (var permiso in nombresPermisos)
        {
            // Usamos el mismo nombre de Claim ("perm") que debe leer AuthorizationBehaviour
            claims.Add(new Claim(ClaimConstants.Permiso, permiso));
        }

        var identity = new ClaimsIdentity(claims, CookieAuthenticationDefaults.AuthenticationScheme);
        var principal = new ClaimsPrincipal(identity);

        var props = new AuthenticationProperties { IsPersistent = rememberMe };
        if (rememberMe)
            props.ExpiresUtc = DateTimeOffset.UtcNow.AddDays(14);

        await _http.HttpContext!.SignInAsync(
            CookieAuthenticationDefaults.AuthenticationScheme,
            principal, props);

        return new AuthUser(Nombre: user.Nombre, ImagenUrl: user.ImagenPerfilUrl,
            Rol: user.Rol.Nombre, Permisos: nombresPermisos);
    }

    /// <summary>
    /// Cierra la sesión actual (elimina cookie).
    /// </summary>
    public async Task SignOutAsync(CancellationToken ct)
    {
        if (_http.HttpContext is not null)
        {
            await _http.HttpContext.SignOutAsync(CookieAuthenticationDefaults.AuthenticationScheme);
        }
    }

    //***** USERS *****//
    public async Task<IEnumerable<UserListModel>> GetAllUsersAsync(CancellationToken cancellationToken)
    {
        var users = await _context.Usuarios
            .AsNoTracking()
            .Select(u => new UserListModel
            {
                Id = u.Id,
                UserName = u.UserName,
                Nombre =
                    u.Nombre + " " + u.ApellidoPaterno + (u.ApellidoMaterno != null ? " " + u.ApellidoMaterno : ""),
                Email = u.Email,
                Telefono = u.Telefono,
                ImagenPerfilUrl = u.ImagenPerfilUrl,
                RolName = u.Rol.Nombre
            }).ToListAsync(cancellationToken);

        return users;
    }

    public async Task<UserModel?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        var user = await _context.Usuarios
            .AsNoTracking()
            .Where(r => r.Id == id)
            .Select(u => new UserModel
            {
                Id = u.Id,
                UserName = u.UserName,
                Nombre = u.Nombre,
                ApellidoPaterno = u.ApellidoPaterno,
                ApellidoMaterno = u.ApellidoMaterno,
                Telefono = u.Telefono,
                Email = u.Email,
                ImagenPerfilUrl = u.ImagenPerfilUrl,
                IdRol = u.IdRol,
                RolName = u.Rol.Nombre
            }).FirstOrDefaultAsync(cancellationToken);

        return user;
    }

    public async Task<IdentityResult> ChangePasswordAsync(Guid userId, string newPassword,
        CancellationToken cancellationToken)
    {
        var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == userId, cancellationToken);

        if (user == null)
            return IdentityResult.Fail("El usuario no existe.");

        var hash = _passwordService.Hash(newPassword);
        user.SetPasswordHash(hash);

        await _context.SaveChangesAsync(cancellationToken);
        return IdentityResult.Ok();
    }

    public async Task<IdentityResult> CreateUserAsync(UserCreateModel model, CancellationToken cancellationToken)
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

    public async Task<IdentityResult> UpdateUserAsync(UserUpdateModel model, CancellationToken cancellationToken)
    {
        var user = await _context.Usuarios
            .FirstOrDefaultAsync(u => u.Id == model.Id, cancellationToken);

        if (user == null)
            return IdentityResult.Fail("El usuario no existe.");

        if (!await _context.Roles.AnyAsync(r => r.Id == model.IdRol, cancellationToken))
            return IdentityResult.Fail("El rol especificado no existe.");

        user.Update(
            nombre: model.Nombre,
            apellidoPaterno: model.ApellidoPaterno,
            apellidoMaterno: model.ApellidoMaterno,
            email: model.Email,
            telefono: model.Telefono,
            imagenPerfilUrl: model.ImagenPerfilUrl,
            idRol: model.IdRol
        );

        await _context.SaveChangesAsync(cancellationToken);

        return IdentityResult.Ok();
    }

    public async Task<IdentityResult> DeleteUserAsync(Guid id, CancellationToken cancellationToken)
    {
        var user = await _context.Usuarios.FirstOrDefaultAsync(u => u.Id == id, cancellationToken);

        if (user == null)
            return IdentityResult.Fail("El usuario no existe.");

        _context.Usuarios.Remove(user);
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

    //ROLES
    public async Task<RolModel?> GetRolByIdAsync(Guid id, CancellationToken cancellationToken)
    {
        return await _context.Roles
            .AsNoTracking()
            .Where(r => r.Id == id)
            .Select(r => new RolModel
            {
                Id = r.Id,
                Nombre = r.Nombre,
                Descripcion = r.Descripcion,
                Permisos = r.PermisosRol.Select(rp => new PermisoModel
                {
                    Id = rp.Permiso.Id,
                    Nombre = rp.Permiso.Nombre,
                    Modulo = rp.Permiso.Modulo,
                    Descripcion = rp.Permiso.Descripcion
                }).ToList()
            })
            .FirstOrDefaultAsync(cancellationToken);
    }

    public async Task<IEnumerable<RolListModel>> GetAllRolesAsync(CancellationToken cancellationToken)
    {
        return await _context.Roles
            .AsNoTracking()
            .Select(r => new RolListModel
            {
                Id = r.Id,
                Nombre = r.Nombre,
                Descripcion = r.Descripcion
            })
            .ToListAsync(cancellationToken);
    }

    public async Task<IdentityResult> CreateRoleAsync(RolCreateModel model, CancellationToken cancellationToken)
    {
        var rol = await _context.Roles.FirstOrDefaultAsync(r => r.Nombre == model.Nombre, cancellationToken);
        if (rol != null)
            return IdentityResult.Fail("El rol ya existe.");

        rol = new Rol { Nombre = model.Nombre, Descripcion = model.Descripcion };

        var permisosValidos = await _context.Permisos
            .Where(p => model.PermisosIds.Contains(p.Id))
            .Select(p => p.Id)
            .ToListAsync(cancellationToken);

        foreach (var permisoId in permisosValidos)
        {
            rol.AsignarPermiso(permisoId);
        }

        await _context.Roles.AddAsync(rol, cancellationToken);
        await _context.SaveChangesAsync(cancellationToken);
        return IdentityResult.Ok();
    }

    public async Task<IdentityResult> UpdateRoleAsync(RolUpdateModel model, CancellationToken cancellationToken)
    {
        var rol = await _context.Roles
            .Include(r => r.PermisosRol)
            .FirstOrDefaultAsync(r => r.Id == model.Id, cancellationToken);

        if (rol == null)
            return IdentityResult.Fail("El rol no existe.");

        rol.Nombre = model.Nombre;
        rol.Descripcion = model.Descripcion;

        var permisosIdsValidos = await _context.Permisos
            .Where(p => model.PermisosIds.Contains(p.Id))
            .Select(p => p.Id)
            .ToListAsync(cancellationToken);

        var permisosParaEliminar = rol.PermisosRol
            .Where(pr => !permisosIdsValidos.Contains(pr.IdPermiso))
            .ToList();

        foreach (var permisoRol in permisosParaEliminar)
        {
            _context.PermisosRol.Remove(permisoRol);
        }

        var idsActuales = rol.PermisosRol.Select(pr => pr.IdPermiso).ToList();
        var idsParaAgregar = permisosIdsValidos.Except(idsActuales);

        foreach (var permisoId in idsParaAgregar)
        {
            rol.AsignarPermiso(permisoId);
        }

        await _context.SaveChangesAsync(cancellationToken);
        return IdentityResult.Ok();
    }

    public async Task<IdentityResult> DeleteRoleAsync(Guid id, CancellationToken cancellationToken)
    {
        var rol = await _context.Roles.FirstOrDefaultAsync(r => r.Id == id, cancellationToken);
        if (rol == null)
            return IdentityResult.Fail("El rol no existe.");
        _context.Roles.Remove(rol);
        await _context.SaveChangesAsync(cancellationToken);
        return IdentityResult.Ok();
    }

    public async Task<IdentityResult> CreateInitialRoleAsync(RolCreateModel model, CancellationToken cancellationToken)
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