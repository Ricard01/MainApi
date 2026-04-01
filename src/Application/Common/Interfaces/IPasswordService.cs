namespace MainApi.Application.Common.Interfaces;

public interface IPasswordService
{
    string Hash(string plainPassword);
    bool Verify(string hashedPassword, string plainPassword, out bool needsRehash);
}