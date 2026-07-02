import {MetodoCosteo} from './metodo-costeo.model';

export interface Producto {
    id: number;
    codigo: string;
    nombre: string;
    metodoCosteo: MetodoCosteo;
    idUnidad: number;
    unidadMedida: string;
    abrevUnidadMedida: string;
    precio1: number;
    precio2: number;
    precio3: number;
}
