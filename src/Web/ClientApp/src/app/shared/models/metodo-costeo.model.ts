export enum MetodoCosteo {
  CostoPromedio = 1,
  CostoPromedioPorAlmacen = 2,
  UltimoCosto = 3,
  UEPS = 4,
  PEPS = 5,
  CostoEspecifico = 6,
  CostoEstandar = 7
}

export const MetodoCosteoDescripcion: Record<MetodoCosteo, string> = {
  [MetodoCosteo.CostoPromedio]: 'Costo Promedio',
  [MetodoCosteo.CostoPromedioPorAlmacen]: 'Costo Promedio por Almacén',
  [MetodoCosteo.UltimoCosto]: 'Último Costo',
  [MetodoCosteo.UEPS]: 'UEPS',
  [MetodoCosteo.PEPS]: 'PEPS',
  [MetodoCosteo.CostoEspecifico]: 'Costo Específico',
  [MetodoCosteo.CostoEstandar]: 'Costo Estándar'
};
