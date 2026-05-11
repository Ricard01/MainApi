using MainApi.Application.Common.Interfaces;
using Microsoft.AspNetCore.DataProtection;

namespace MainApi.Infrastructure.CONTPAQi.Security;

public class EncryptionService : IEncryptionService
{
    private readonly IDataProtector _protector;

    public EncryptionService(IDataProtectionProvider provider)
    {
        _protector = provider.CreateProtector("contpaqi-db");
    }

    public string Encrypt(string value)
        => _protector.Protect(value);

    public string Decrypt(string value)
        => _protector.Unprotect(value);
}