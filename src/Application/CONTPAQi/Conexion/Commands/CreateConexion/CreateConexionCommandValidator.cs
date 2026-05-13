using FluentValidation;
using MainApi.Application.Common.Validation;

namespace MainApi.Application.CONTPAQi.Conexion.Commands.CreateConexion;


public class CreateConexionCommandValidator : AbstractValidator<CreateConexionCommand>
{
    public CreateConexionCommandValidator()
    {
        RuleFor(v => v.Servidor).RuleRequiredMax(100);
        RuleFor(v => v.BaseDatos).RuleRequiredMax(100);
        RuleFor(v => v.SqlUser).RuleRequiredMax(100);
        RuleFor(v => v.Password).RuleRequiredMax(500);
        RuleFor(v => v.Puerto).GreaterThan(0).WithMessage("El puerto debe ser un número válido.");
    }
}