using MainApi.Application.Features.Auth.Commands.Login;
using MainApi.Application.Features.Auth.Commands.LogOut;

namespace MainApi.Web.Endpoints;

public class Auth : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        // ".AllowAnonymous"
        var authBase = app.MapGroup(this)
            .WithTags(nameof(Auth))
            .WithOpenApi();

        authBase.MapPost(Login, "login");

        // Subgrupo PROTEGIDO "RequireAuthorization"
        var authPrivate = authBase.MapGroup(string.Empty).RequireAuthorization();

        // authPrivate.MapGet(GetCurrentUser, "getCurrentUser");
        authPrivate.MapPost(Logout, "logOut");
    }

    private static async Task<IResult> Login(HttpContext http, ISender sender, LoginCommand command,
        CancellationToken ct)
    {
        try
        {
            var user = await sender.Send(command, ct);
            return Results.Ok(user);
        }
        catch (UnauthorizedAccessException ex)
        {
            return Results.Problem(
                title: "Unauthorized",
                detail: ex.Message,
                statusCode: StatusCodes.Status401Unauthorized
            );
        }
    }
    

    private async Task<IResult> Logout(HttpContext http, ISender sender, CancellationToken ct)
    {
        if (!(http.User?.Identity?.IsAuthenticated ?? false))
            return Results.NoContent();

        await sender.Send(new LogoutCommand(), ct);

        return Results.NoContent();
    }
}