namespace MainApi.Application.Common.Validation;

public static class FluentValidationExtensions
{
    public static IRuleBuilderOptions<T, string> RuleRequiredMax<T>(
        this IRuleBuilder<T, string> rule, int maxLength)
    {
        return rule
            .NotEmpty().WithMessage("'{PropertyName}' es obligatorio.")
            .MaximumLength(maxLength).WithMessage("'{PropertyName}' debe tener máximo {MaxLength} caracteres.");
    }
}
