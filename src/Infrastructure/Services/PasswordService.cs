using MainApi.Application.Common.Interfaces;
using Microsoft.AspNetCore.Identity;

namespace MainApi.Infrastructure.Services;

public sealed class PasswordService(IPasswordHasher<object> hasher) : IPasswordService
{
    public string Hash(string plainPassword)
        => hasher.HashPassword(new object(), plainPassword);

    public bool Verify(string hashedPassword, string plainPassword, out bool needsRehash)
    {
        var result = hasher.VerifyHashedPassword(new object(), hashedPassword, plainPassword);
        needsRehash = result == PasswordVerificationResult.SuccessRehashNeeded;
        return result == PasswordVerificationResult.Success || needsRehash;
    }
}
