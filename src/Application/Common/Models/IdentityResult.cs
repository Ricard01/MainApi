namespace MainApi.Application.Common.Models;

public class IdentityResult
{
    public bool Success { get; }
    public List<string> Errors { get; }

    private IdentityResult(bool success, List<string>? errors = null)
    {
        Success = success;
        Errors = errors ?? new List<string>();
    }

    public static IdentityResult Ok() => new(true);
    public static IdentityResult Fail(params string[] errors) => new(false, errors.ToList());
    public static IdentityResult Fail(IEnumerable<string> errors) => new(false, errors.ToList());
}
