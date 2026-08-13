using MainApi.Application.CONTPAQi.Cotizaciones.Commands.CreateCotizacion;

namespace MainApi.Application.CONTPAQi.Cotizaciones.Commands.UpdateCotizacion;

public sealed class UpdateCotizacionCommandValidator : AbstractValidator<UpdateCotizacionCommand>
{
    public UpdateCotizacionCommandValidator()
    {
        RuleFor(x => x.Id).GreaterThan(0);
        RuleFor(x => x.IdAgente).GreaterThanOrEqualTo(0);
        RuleFor(x => x.Cliente).NotEmpty().MaximumLength(50);
        RuleFor(x => x.Contacto).MaximumLength(20);
        RuleFor(x => x.Email).MaximumLength(50);
        RuleFor(x => x.Telefono).MaximumLength(50);
        RuleFor(x => x.Observaciones).MaximumLength(3000);
        RuleFor(x => x.Productos).NotEmpty();
        RuleForEach(x => x.Productos)
            .SetValidator(new CreateCotizacionCommandValidator.ProductoCotizacionDtoValidator());
    }
}
