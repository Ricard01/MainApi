using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Validation;

namespace MainApi.Application.Features.Roles.Commands.UpdateRol;

public class UpdateRolCommandValidator : AbstractValidator<UpdateRolCommand>
{
    private readonly IAppDbContext _context;

    public UpdateRolCommandValidator(IAppDbContext context)
    {
        _context = context;
        RuleFor(r => r.Nombre).RuleRequiredMax(50)
            .MinimumLength(4).WithMessage("El nombre de rol debe tener al menos 4 caracteres")
            .MustAsync(async (command, nombre, cancellationToken) =>
                await BeUniqueName(command.Id, nombre, cancellationToken))
            .WithMessage(r => $"'{r.Nombre}'El nombre de rol ya existe.")
            .WithErrorCode("Unique");
        RuleFor(r => r.Descripcion).MaximumLength(200);
        RuleFor(r => r.PermisosIds).NotEmpty().WithMessage("Seleccione al menos un permiso.");
    }

    private async Task<bool> BeUniqueName(Guid rolId, string nombre, CancellationToken cancellationToken)
    {
        return !await _context.Roles
            .AnyAsync(u => u.Nombre == nombre && u.Id != rolId, cancellationToken);
    }
}