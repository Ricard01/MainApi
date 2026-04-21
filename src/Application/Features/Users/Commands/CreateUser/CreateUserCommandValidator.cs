using MainApi.Application.Common.Interfaces;
using MainApi.Application.Common.Validation;

namespace MainApi.Application.Features.Users.Commands.CreateUser;

public class CreateUserCommandValidator : AbstractValidator<CreateUserCommand>
{
    private readonly IAppDbContext _context;
    public CreateUserCommandValidator(IAppDbContext context)
    {
        _context = context;
        RuleFor(u => u.UserName).RuleRequiredMax(100)
            .MinimumLength(4).WithMessage("El nombre de usuario debe tener al menos 4 caracteres")
            .MustAsync(BeUniqueUserName)
            .WithMessage( u => $"'{u.UserName}' el nombre de usuario ya existe.")
            .WithErrorCode("Unique");
        RuleFor(u => u.Nombre).RuleRequiredMax(200);
        RuleFor(u => u.ApellidoPaterno).RuleRequiredMax(100).WithMessage("Maximo 100 caracteres");;
        RuleFor(u => u.ApellidoMaterno).MaximumLength(100).WithMessage("Maximo 100 caracteres");
        RuleFor(u => u.Telefono).MaximumLength(20).WithMessage("Maximo 20 caracteres");
        RuleFor(u => u.Email).RuleRequiredMax(100)
            .MustAsync(BeUniqueEmail)
            .WithMessage( u => $"'{u.Email}' el email ya existe.")
            .WithErrorCode("Unique");
        RuleFor(u => u.Password)
            .NotEmpty().WithMessage("La contraseña no puede estar vacía")
            .MinimumLength(8).WithMessage("La contraseña debe tener al menos 8 caracteres")
            .Matches("[A-Z]").WithMessage("La contraseña debe contener al menos una letra mayúscula")
            .Matches("[a-z]").WithMessage("La contraseña debe contener al menos una letra minúscula")
            .Matches("[0-9]").WithMessage("La contraseña debe contener al menos un número")
            .Matches("[^a-zA-Z0-9]").WithMessage("La contraseña debe contener al menos un carácter especial");
        RuleFor(u => u.IdRol).NotEmpty().WithMessage("Seleccione un rol.");

    }

    private async Task<bool> BeUniqueUserName(string userName, CancellationToken cancellationToken)
    {
        return !await _context.Usuarios.AnyAsync(u => u.UserName == userName, cancellationToken);
    }
    
    
    private async Task<bool> BeUniqueEmail(string email, CancellationToken cancellationToken)
    {
        return !await _context.Usuarios.AnyAsync(u => u.Email == email, cancellationToken);
    }
    
    
}
