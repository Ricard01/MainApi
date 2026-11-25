using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using FluentValidation.Results;
using MainApi.Application.Common.Exceptions;
using MainApi.Application.Common.Interfaces;
using MainApi.Application.CONTPAQi.Facturas.ComercialSdk;
using Microsoft.AspNetCore.Mvc;
using ValidationException = MainApi.Application.Common.Exceptions.ValidationException;

namespace MainApi.Infrastructure.CONTPAQi.ComercialSdk;

/// <summary>Configuración del servicio SDK de CONTPAQi (sección <c>ComercialSdk</c>).</summary>
public sealed class ComercialSdkClientOptions
{
    public const string Seccion = "ComercialSdk";

    /// <summary>URL base del servicio, p. ej. <c>http://localhost:5087</c>.</summary>
    public string BaseUrl { get; set; } = "http://localhost:5087";

    /// <summary>
    /// Tiempo máximo por petición. El SDK atiende una operación a la vez, así que una factura puede
    /// esperar a que terminen las que llegaron antes.
    /// </summary>
    public TimeSpan Timeout { get; set; } = TimeSpan.FromSeconds(120);
}

/// <summary>Implementación HTTP de <see cref="IComercialSdkClient"/> contra <c>/api/facturas</c>.</summary>
public sealed class ComercialSdkClient(HttpClient httpClient) : IComercialSdkClient
{
    private static readonly JsonSerializerOptions Json = new(JsonSerializerDefaults.Web);

    public async Task<FacturaSdkCreada> CrearFacturaAsync(NuevaFacturaSdk factura, CancellationToken cancellationToken)
    {
        using var response = await EnviarAsync(
            () => httpClient.PostAsJsonAsync("api/facturas", factura, Json, cancellationToken));

        await VerificarAsync(response, cancellationToken);

        return await response.Content.ReadFromJsonAsync<FacturaSdkCreada>(Json, cancellationToken)
               ?? throw new ComercialSdkException("El servicio SDK de CONTPAQi respondió sin datos de la factura.");
    }

    public async Task BorrarFacturaAsync(int idDocumento, CancellationToken cancellationToken)
    {
        using var response = await EnviarAsync(
            () => httpClient.DeleteAsync($"api/facturas/{idDocumento}", cancellationToken));

        await VerificarAsync(response, cancellationToken);
    }

    private async Task<HttpResponseMessage> EnviarAsync(Func<Task<HttpResponseMessage>> enviar)
    {
        try
        {
            return await enviar();
        }
        catch (HttpRequestException exception)
        {
            throw new ComercialSdkException(
                $"No se pudo comunicar con el servicio SDK de CONTPAQi ({httpClient.BaseAddress}). Verifica que esté en ejecución.",
                exception);
        }
        catch (TaskCanceledException exception) when (exception.InnerException is TimeoutException)
        {
            throw new ComercialSdkException("El servicio SDK de CONTPAQi no respondió a tiempo.", exception);
        }
    }

    private static async Task VerificarAsync(HttpResponseMessage response, CancellationToken cancellationToken)
    {
        if (response.IsSuccessStatusCode)
        {
            return;
        }

        var problema = await LeerProblemaAsync(response, cancellationToken);

        if (response.StatusCode == HttpStatusCode.BadRequest && problema?.Errors.Count > 0)
        {
            throw new ValidationException(problema.Errors
                .SelectMany(error => error.Value.Select(mensaje => new ValidationFailure(error.Key, mensaje))));
        }

        var detalle = problema?.Detail ?? problema?.Title ?? response.ReasonPhrase;
        throw new ComercialSdkException($"CONTPAQi rechazó la operación ({(int)response.StatusCode}): {detalle}");
    }

    private static async Task<ValidationProblemDetails?> LeerProblemaAsync(
        HttpResponseMessage response,
        CancellationToken cancellationToken)
    {
        try
        {
            return await response.Content.ReadFromJsonAsync<ValidationProblemDetails>(Json, cancellationToken);
        }
        catch (JsonException)
        {
            return null;
        }
        catch (NotSupportedException)
        {
            // Respuesta sin JSON (por ejemplo, un 502 de un proxy).
            return null;
        }
    }
}
