using System.Reflection;
using MainApi.Application.Common.Exceptions;
using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Validation;
using MainApi.Domain.Constants;

namespace MainApi.Application.Common.Behaviours;

public class AuthorizationBehaviour<TRequest, TResponse> : IPipelineBehavior<TRequest, TResponse>
    where TRequest : notnull
{
    private readonly IUser _user;


    public AuthorizationBehaviour(IUser user)
    {
        _user = user;
    }

    public async Task<TResponse> Handle(TRequest request, RequestHandlerDelegate<TResponse> next,
        CancellationToken cancellationToken)
    {
        // 1. Obtener todos los atributos RequirePermissionAttribute 
        var permissionAttributes = request.GetType().GetCustomAttributes<RequirePermissionAttribute>();

        // Si no hay atributos de permisos, no se requiere autorización
        if (!permissionAttributes.Any())
        {
            return await next();
        }

        var principal = _user.Principal;
        // 2. Validar que el usuario esté autenticado
        if (principal?.Identity?.IsAuthenticated != true)
        {
            throw new UnauthorizedAccessException();
        }

        // 3. Extraer todos los nombres de permisos requeridos
        var permisosRequeridos = permissionAttributes.Select(a => a.PermissionName);

        // 4. Verificar que el usuario tenga TODOS los permisos requeridos
        var tieneTodosLosPermisos = permisosRequeridos.All(permisoRequerido =>
            principal.HasClaim(claim =>
                claim.Type == ClaimConstants.Permiso &&
                claim.Value == permisoRequerido));

        if (!tieneTodosLosPermisos)
            throw new ForbiddenAccessException();

        return await next();
    }
}