using MainApi.Application.Common.Validation;

namespace MainApi.Application.CONTPAQi.Cotizaciones.Commands.CreateCotizacion;

public class CreateCotizacionCommandValidator : AbstractValidator<CreateCotizacionCommand>
{
    public CreateCotizacionCommandValidator()
    {
        RuleFor(x => x.IdAgente).NotNull().NotEmpty();
        RuleFor(x => x.Contacto)
            .MaximumLength(20)
            .WithMessage("Maximo 20 caracteres");
        RuleFor(x => x.Email).MaximumLength(50)
            .WithMessage("Maximo 50 caracteres");
        RuleFor(x => x.Telefono).MaximumLength(50);
        RuleFor(x => x.Productos)
            .NotEmpty()
            .WithMessage("Debe capturar al menos un producto.");
        RuleForEach(x => x.Productos)
            .SetValidator(new ProductoCotizacionDtoValidator());
    }

    public class ProductoCotizacionDtoValidator : AbstractValidator<ProductoCotizacionDto>
    {
        public ProductoCotizacionDtoValidator()
        {
            RuleFor(x => x.IdProducto)
                .GreaterThan(0).WithMessage("El Id del producto debe ser válido.");

            RuleFor(x => x.Cantidad)
                .GreaterThan(0).WithMessage("La cantidad debe ser mayor a cero.");

            RuleFor(x => x.Precio)
                .GreaterThanOrEqualTo(0).WithMessage("El precio no puede ser negativo.");
        }
    }
}
