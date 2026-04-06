using System.Security.Claims;
using MainApi.Application.Common.Interfaces;

namespace MainApi.Web.Services;

public class CurrentUser : IUser
{
    private readonly IHttpContextAccessor _httpContextAccessor;

    public CurrentUser(IHttpContextAccessor httpContextAccessor)
    {
        _httpContextAccessor = httpContextAccessor;
    }

    public string? Id => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.NameIdentifier);
    public string? Rol => _httpContextAccessor.HttpContext?.User?.FindFirstValue(ClaimTypes.Role);
    public ClaimsPrincipal? Principal => _httpContextAccessor.HttpContext?.User;
}
