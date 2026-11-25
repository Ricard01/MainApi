namespace MainApi.Application.CONTPAQi.Cotizaciones.Commands.FacturarCotizacion;

public sealed class FacturarCotizacionCommandValidator : AbstractValidator<FacturarCotizacionCommand>
{
    public FacturarCotizacionCommandValidator()
    {
        RuleFor(x => x.IdCotizacion).GreaterThan(0);
        RuleFor(x => x.IdCliente)
            .GreaterThan(0)
            .When(x => x.IdCliente is not null)
            .WithMessage("El cliente seleccionado no es válido.");
    }
}