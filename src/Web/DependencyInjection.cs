using Azure.Identity;
using MainApi.Infrastructure.Data;
using Microsoft.AspNetCore.Authentication.Cookies;

namespace MainApi.Web;

public static class DependencyInjection
{
    public static IServiceCollection AddWebServices(this IServiceCollection services)
    {
        services.AddHttpContextAccessor();
        // By default, cookie authentication redirects the user to the login URL if authentication failed. Hence, we’re setting the delegate function options.Events.OnRedirectToLogin with a lambda expression.
        // This expression returns an unauthorized HTTP status code 401.
        services.AddAuthentication(CookieAuthenticationDefaults.AuthenticationScheme)
            .AddCookie(options =>
            {
                options.Cookie.Name = "MainApi.Cookie";
                options.Cookie.HttpOnly = true;
                options.Cookie.SecurePolicy = CookieSecurePolicy.Always;
                options.Cookie.SameSite = SameSiteMode.Lax; //mismo origen 

                options.ExpireTimeSpan = TimeSpan.FromMinutes(60); // Expira por inactividad
                options.SlidingExpiration = true;
                options.LoginPath = "/login";

                options.Events.OnRedirectToLogin = context =>
                {
                    if (context.Request.Path.StartsWithSegments("/api"))
                    {
                        context.Response.StatusCode = StatusCodes.Status401Unauthorized; // Para API, responde con 401
                    }
                    else
                    {
                        context.Response.Redirect(context.RedirectUri); // Para no-API, redirige al login
                    }

                    return Task.CompletedTask;
                };
                options.Events.OnRedirectToAccessDenied = context =>
                {
                    if (context.Request.Path.StartsWithSegments("/api"))
                    {
                        context.Response.StatusCode = StatusCodes.Status403Forbidden;
                    }
                    else
                    {
                        context.Response.Redirect(context.RedirectUri);
                    }

                    return Task.CompletedTask;
                };
            });

        services.AddAuthorization();

        return services;
    }
}