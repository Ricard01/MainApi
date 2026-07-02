import {inject, Injectable} from '@angular/core';
import {API_BASE_URL} from '../../app.config';
import {HttpClient, HttpParams} from '@angular/common/http';
import {Producto} from '../models/producto.model';
import {TipoProducto} from '../enums/producto.enum';
import {EstatusCONTPAQi} from '../enums/EstatusCONTPAQi.enum';

@Injectable({
  providedIn: 'root',
})
export class ProductoApi {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL) + '/productos';

  search(term: string, tipos: TipoProducto[] = [], estatus: EstatusCONTPAQi | null = EstatusCONTPAQi.Activo) {
    let params = new HttpParams().set('search', term);

    tipos.forEach(tipo => {
      params = params.append('tiposProducto', tipo.toString());
    });

    if (estatus !== null) {
      params = params.set('estatus', estatus.toString());
    }

    return this.http.get<Producto[]>(`${this.baseUrl}/search`, { params });
  }

  // Para cualqueir otro escenario
  get(tipos?: TipoProducto[], estatus?: EstatusCONTPAQi) {
    let params = new HttpParams();

    if (estatus !== undefined && estatus !== null) {
      params = params.set('estatus', estatus.toString());
    }

    if (tipos && tipos.length > 0) {
      tipos.forEach(tipo => {
        params = params.append('tipos', tipo.toString());
      });
    }

    // Pasamos los params en las opciones de la petición GET
    return this.http.get<Producto[]>(this.baseUrl, {params});
  }

  getAllActivos() {
    return this.get();
  }

  // Todos los productos y paquetes activos (Inventariables)
  getProductos() {
    return this.get(
      [TipoProducto.Producto, TipoProducto.Paquete],
    );
  }

  // Todos los servicios activos
  getServicios() {
    return this.get(
      [TipoProducto.Servicio]
    );
  }
}
