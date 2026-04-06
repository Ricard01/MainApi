using System.Reflection;
using MainApi.Application.Common.Behaviours;
using Microsoft.Extensions.DependencyInjection;

namespace MainApi.Application;

public static class DependencyInjection
{
    public static IServiceCollection AddApplicationServices(this IServiceCollection services)
    {
        services.AddValidatorsFromAssembly(Assembly.GetExecutingAssembly());

        services.AddMediatR(cfg =>
        {
            cfg.RegisterServicesFromAssembly(Assembly.GetExecutingAssembly());
            cfg.AddOpenRequestPreProcessor(typeof(LoggingBehaviour<>));
            cfg.AddOpenBehavior(typeof(UnhandledExceptionBehaviour<,>));
            cfg.AddOpenBehavior(typeof(AuthorizationBehaviour<,>));
            cfg.AddOpenBehavior(typeof(ValidationBehaviour<,>)); // Para que funcionen los Validators en CQRS
            cfg.AddOpenBehavior(typeof(PerformanceBehaviour<,>));
        });
   

        return services;
    }
}