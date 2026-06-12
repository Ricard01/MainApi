namespace MainApi.Application.CONTPAQi.Clientes.Queries.GetAllClientes;

public class ClienteDto
{
    public int Id { get; set; }
    public required string Codigo { get; set; }
    public required string RazonSocial { get; set; }
}