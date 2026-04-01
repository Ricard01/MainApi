using MainApi.Domain.Common;

namespace MainApi.Domain.Entities;

public class Empresa : BaseEntity
{
    public required string Nombre { get; set; }
    public string? Rfc { get; set; }
    public string? Estado { get; set; }
    public string? Ciudad { get; set; }
    public string? Municipio { get; set; }
    public string? Domicilio { get; set; }
    public string? CodigoPostal { get; set; }
    public string? RazonSocial  { get; set; }
    public string? Telefono { get; set; }
    public string? Email { get; set; }
    public string? LogoUrl { get; set; }

}