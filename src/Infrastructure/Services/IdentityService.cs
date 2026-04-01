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
            claims.Add(new Claim("perm", permiso));
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