import {inject, Injectable} from '@angular/core';
import {API_BASE_URL} from '../../app.config';
import {HttpClient} from '@angular/common/http';
import {ExistenciaCosto} from '../models/existenciaCosto.model';

@Injectable({
  providedIn: 'root',
})
export class ExistenciaApi {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL) + '/existencias/producto';

  getExistenciaCosto(idProducto: number, idAlmacen: number) {
    return this.http.get<ExistenciaCosto>(`${this.baseUrl}/${idProducto}/costo`, {params: {idAlmacen}});
  }

}
