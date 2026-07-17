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

public enum TipoDocumento
{
    Cotizacion = 1,
    Pedido = 2,
    Remision = 3,
    Factura = 4,                    // Factura Crédito y Factura al Contado
    DevolucionVenta = 5,
    DevolucionRemision = 6,
    NotaCredito = 7,
    CambioCliente = 8,
    PagoCliente = 9,
    ChequeRecibido = 10,
    HonorariosCliente = 11,
    AbonoCliente = 12,              // Abono del Cliente y Abono por Letras
    NotaCargoCliente = 13,          // Nota de Cargo al Cliente y Saldo Inicial del cliente
    DescuentoProntoPago = 14,
    Pagare = 15,
    InteresMoratorio = 16,
    OrdenCompra = 17,
    ConsignacionProveedor = 18,
    Compra = 19,
    DevolucionCompra = 20,
    DevolucionConsignacion = 21,
    NotaCreditoProveedor = 22,
    PagoProveedor = 23,
    ChequeEmitido = 24,
    HonorariosProveedor = 25,
    AbonoProveedor = 26,
    CargoProveedor = 27,            // Cargo del Proveedor y Saldo Inicial del proveedor
    UtilidadCambiariaCliente = 28,
    PerdidaCambiariaCliente = 29,
    UtilidadCambiariaProveedor = 30,
    PerdidaCambiariaProveedor = 31,
    EntradaAlmacen = 32,            // Entrada al Almacén y Ajuste por Inventario Físico Entrada
    SalidaAlmacen = 33,             // Salida del Almacén y Ajuste por Inventario Físico Salida
    Traspasos = 34,
    NotaVenta = 35,
    DevolucionNotaVenta = 36,
    AjusteCosto = 37,
    CotizacionProveedor = 38
}