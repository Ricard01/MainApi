using FluentValidation;
using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Validation;

namespace MainApi.Application.CONTPAQi.Conexion.Commands.SaveConexion;

public class SaveConexionCommandValidator : AbstractValidator<SaveConexionCommand>
{
    private readonly IAppDbContext _context;

    public SaveConexionCommandValidator(IAppDbContext context)
    {
        _context = context;

        RuleFor(v => v.Servidor).RuleRequiredMax(100);
        RuleFor(v => v.BaseDatos).RuleRequiredMax(100);
        RuleFor(v => v.SqlUser).RuleRequiredMax(100);

        WhenAsync(async (command, cancellationToken) =>
        {
            bool existeConfiguracion = await _context.ContpaqiConexion.AnyAsync(cancellationToken);
            // Si NO existe (es un Create), esta condición retorna 'true' y ejecuta la validación interna
            return !existeConfiguracion; 
        }, () =>
        {
            RuleFor(v => v.Password)
                .NotEmpty().WithMessage("La contraseña es obligatoria.")
                .MaximumLength(500).WithMessage("La contraseña no puede exceder los 500 caracteres.");
        });
        RuleFor(v => v.Puerto).GreaterThan(0).WithMessage("El puerto debe ser un número válido.");
    }
}