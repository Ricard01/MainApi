using MainApi.Application.Features.Auth.Commands.Login;
using MainApi.Application.Features.Auth.Commands.LogOut;
using MainApi.Application.Features.Auth.Queries.Me;


namespace MainApi.Web.Endpoints;

public class Auth : EndpointGroupBase
{
    public override void Map(WebApplication app)
    {
        var authBase = app.MapGroup(this);
        authBase.MapPost("login", Login).AllowAnonymous();


        var authPrivate = authBase.RequireAuthorization();
        authPrivate.MapGet("me", Me);
        authPrivate.MapPost("logout", Logout);
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

    private static async Task<IResult> Me(ISender sender, CancellationToken ct)
    {
        var user = await sender.Send(new MeQuery(), ct); 
        return Results.Ok(user);
    }


    private async Task<IResult> Logout(HttpContext http, ISender sender, CancellationToken ct)
    {
        if (!(http.User?.Identity?.IsAuthenticated ?? false))
            return Results.NoContent();

        await sender.Send(new LogoutCommand(), ct);

        return Results.NoContent();
    }
}