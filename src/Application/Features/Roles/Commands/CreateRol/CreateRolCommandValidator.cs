using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Validation;

namespace MainApi.Application.Features.Roles.Commands.CreateRol;

public class CreateRolCommandValidator : AbstractValidator<CreateRolCommand>
{
    private readonly IAppDbContext _context;

    public CreateRolCommandValidator(IAppDbContext context)
    {
        _context = context;
        RuleFor(r => r.Nombre).RuleRequiredMax(50)
            .MinimumLength(4).WithMessage("El nombre de rol debe tener al menos 4 caracteres")
            .MustAsync(BeUniqueName)
            .WithMessage(r => $"'{r.Nombre}'El nombre de rol ya existe.")
            .WithErrorCode("Unique");
        RuleFor(r => r.Descripcion).MaximumLength(200);
        RuleFor(r => r.PermisosIds).NotEmpty().WithMessage("Seleccione al menos un permiso.");
    }

    private async Task<bool> BeUniqueName(string nombre, CancellationToken cancellationToken)
    {
        return !await _context.Roles.AnyAsync(u => u.Nombre == nombre, cancellationToken);
    }
}