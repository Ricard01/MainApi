namespace MainApi.Application.Common.Exceptions;

/// <summary>
/// El servicio SDK de CONTPAQi Comercial devolvió un error o no respondió. Se responde como 502 (Bad Gateway).
/// </summary>
public sealed class ComercialSdkException : Exception
{
    public ComercialSdkException(string message) : base(message)
    {
    }

    public ComercialSdkException(string message, Exception innerException) : base(message, innerException)
    {
    }
}
