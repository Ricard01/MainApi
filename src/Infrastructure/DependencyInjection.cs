using MainApi.Application.Common.Interfaces;
using MainApi.Infrastructure.Data;
using MainApi.Infrastructure.Services;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore.Diagnostics;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;

namespace Microsoft.Extensions.DependencyInjection;

public static class DependencyInjection
{
    public static void AddInfrastructureServices(this IHostApplicationBuilder builder)
    {
        var connectionString = builder.Configuration.GetConnectionString("MainConnection");
        Guard.Against.Null(connectionString, message: "Connection string 'MainConnection' not found.");

        builder.Services.AddDbContext<AppDbContext>((sp, options) =>
        {
            options.AddInterceptors(sp.GetServices<ISaveChangesInterceptor>());
            options.UseSqlServer(connectionString);
            options.ConfigureWarnings(warnings => warnings.Ignore(RelationalEventId.PendingModelChangesWarning));
        });
        
        builder.Services.AddScoped<IAppDbContext>(provider => provider.GetRequiredService<AppDbContext>());
        builder.Services.AddScoped<AppDbContextInitialiser>();
        
        builder.Services.AddSingleton<IPasswordHasher<object>, PasswordHasher<object>>(); // singleton cuando no dependes de DbContext/HttpContext.
        builder.Services.AddScoped<IPasswordService, PasswordService>();
        builder.Services.AddScoped<IIdentityService, IdentityService>();
        
    }
}