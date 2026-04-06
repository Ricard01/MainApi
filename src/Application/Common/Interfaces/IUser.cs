using System.Security.Claims;

namespace MainApi.Application.Common.Interfaces;

public interface IUser
{
    string? Id { get; }
    string? Rol { get; }

    ClaimsPrincipal? Principal { get; }
}