import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '../../app.config';
import { HttpClient } from '@angular/common/http';
import { Almacen } from '../models/almacen.model';

@Injectable({
  providedIn: 'root',
})
export class AlmacenApi {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL) + '/almacenes';

  getAll() {
    return this.http.get<Almacen[]>(`${this.baseUrl}`);
  }
}
