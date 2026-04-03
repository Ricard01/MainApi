using MainApi.Application.Common.Models;
using MainApi.Application.Features.Auth.Commands.Login;


namespace MainApi.Application.Common.Interfaces;

public interface IIdentityService
{
    /// <summary>
    /// Autentica un usuario y genera la cookie de sesión.
    /// </summary>
    /// <param name="userName">Nombre de usuario</param>
    /// <param name="password">Contraseña en texto plano</param>
    /// <param name="rememberMe">Indica si la sesión es persistente</param>
    /// <returns>Información del usuario autenticado</returns>
    Task<AuthUser> SignInAsync(string userName, string password, bool rememberMe,
        CancellationToken cancellationToken); // emite cookie

    Task SignOutAsync(CancellationToken cancellationToken);

    Task<IEnumerable<UserListModel>> GetAllUsersAsync(CancellationToken cancellationToken);

    Task<UserModel?> GetUserByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<IdentityResult> ChangePasswordAsync(Guid userId, string newPassword, CancellationToken cancellationToken);

    Task<IdentityResult> CreateUserAsync(UserCreateModel userCreate, CancellationToken cancellationToken);

    Task<IdentityResult> UpdateUserAsync(UserUpdateModel user, CancellationToken cancellationToken);

    Task<IdentityResult> DeleteUserAsync(Guid id, CancellationToken cancellationToken);

    Task<RolModel?> GetRolByIdAsync(Guid id, CancellationToken cancellationToken);

    Task<IEnumerable<RolListModel>> GetAllRolesAsync(CancellationToken cancellationToken);

    Task<IdentityResult> CreateRoleAsync(RolCreateModel model, CancellationToken cancellationToken);
    Task<IdentityResult> UpdateRoleAsync(RolUpdateModel model, CancellationToken cancellationToken);
    Task<IdentityResult> DeleteRoleAsync(Guid Id, CancellationToken cancellationToken);

    // Task<UserDto?> FindByUserNameAsync(string email);

    // Task<bool> CheckPasswordAsync(string userId, string password);

    Task<string?> GetUserNameAsync(string userId);

    /// <summary>
    /// Crea un nuevo rol de usuario con sus respectivos permisos.
    /// </summary>
    /// <param name="model">Datos del rol a crear.</param>
    /// <param name="cancellationToken">Token para cancelar la operación.</param>
    /// <returns>
    /// Devuelve un <see cref="IdentityResult"/> indicando si la operación fue exitosa o si falló.
    /// </returns>
    Task<IdentityResult> CreateInitialRoleAsync(RolCreateModel model, CancellationToken cancellationToken);

    /// <summary>
    /// Verifica si existe un rol con el nombre especificado.
    /// </summary>
    /// <param name="name">Nombre del rol a verificar.</param>
    /// <returns>True si existe, False caso contrario.</returns>
    Task<bool> RolExistsAsync(string name);

    // Task<bool> IsInRoleAsync(string userId, string role);
    // Task<bool> AuthorizeAsync(string userId, string policyName);
    // Task<IdentityResult> DeleteUserAsync(string userId);
}