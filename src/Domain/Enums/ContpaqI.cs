namespace MainApi.Domain.Enums;

public enum TipoProducto
{
    Producto = 1,
    Paquete = 2,
    Servicio = 3
}

public enum EstatusCONTPAQi
{
    Inactivo = 0,
    Activo = 1
}

public enum MetodoCosteo
{
    CostoPromedio = 1,
    CostoPromedioPorAlmacen = 2,
    UltimoCosto = 3,
    UEPS = 4,
    PEPS = 5,
    CostoEspecifico = 6,
    CostoEstandar = 7
}

public enum ControlExistencia
{
    Unidades = 1,
    Caracteristicas = 2,
    Series = 3,
    Pedimentos = 4,
    Lotes = 5
}