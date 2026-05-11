namespace MainApi.Application.Common.Interfaces;

public interface IEncryptionService
{
    string Encrypt(string value);

    string Decrypt(string value);
}