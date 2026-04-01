using MainApi.Application.Common.Models;


namespace MainApi.Application.Common.Interfaces;

public interface IIdentityService
{
    Task<IdentityResult> CreateUserAsync(UserModel user, CancellationToken cancellationToken);


//     // Task<UserDto?> FindByUserNameAsync(string email);
//     //
//     // Task<bool> CheckPasswordAsync(string userId, string password);
//
    Task<string?> GetUserNameAsync(string userId);

    /// <summary>
    /// Crea un nuevo rol de usuario con sus respectivos permisos.
    /// </summary>
    /// <param name="model">Datos del rol a crear.</param>
    /// <param name="cancellationToken">Token para cancelar la operación.</param>
    /// <returns>
    /// Devuelve un <see cref="IdentityResult"/> indicando si la operación fue exitosa o si falló.
    /// </returns>
    Task<IdentityResult> CreateRoleAsync(RolModel model, CancellationToken cancellationToken);

    /// <summary>
    /// Verifica si existe un rol con el nombre especificado.
    /// </summary>
    /// <param name="name">Nombre del rol a verificar.</param>
    /// <returns>True si existe, False caso contrario.</returns>
    Task<bool> RolExistsAsync(string name);
//
//     Task<bool> IsInRoleAsync(string userId, string role);
//
    // Task<bool> AuthorizeAsync(string userId, string policyName);
//
//
//     Task<IdentityResult> DeleteUserAsync(string userId);
}