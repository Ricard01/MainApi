using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Validation;

namespace MainApi.Application.Features.Users.UpdateUser;

public class UpdateUserCommandValidator : AbstractValidator<UpdateUserCommand>
{
    private readonly IAppDbContext _context;

    public UpdateUserCommandValidator(IAppDbContext context)
    {
        _context = context;
        RuleFor(u => u.Nombre).RuleRequiredMax(200);
        RuleFor(u => u.ApellidoPaterno).RuleRequiredMax(100);
        RuleFor(u => u.ApellidoMaterno).MaximumLength(100).WithMessage("Maximo 100 caracteres");
        RuleFor(u => u.Telefono).MaximumLength(20).WithMessage("Maximo 20 caracteres");
        RuleFor(u => u.Email)
            .RuleRequiredMax(100)
            .MustAsync(async (command, email, cancellationToken) =>
                await BeUniqueEmail(command.Id, email, cancellationToken)) // Pasamos el Id del comando
            .WithMessage(u => $"El correo '{u.Email}' ya está registrado por otro usuario.")
            .WithErrorCode("Unique");
        RuleFor(u => u.IdRol).NotEmpty().WithMessage("Seleccione un rol.");
    }


    private async Task<bool> BeUniqueEmail(Guid userId, string email, CancellationToken cancellationToken)
    {
        return !await _context.Usuarios
            .AnyAsync(u => u.Email == email && u.Id != userId, cancellationToken);
    }
}