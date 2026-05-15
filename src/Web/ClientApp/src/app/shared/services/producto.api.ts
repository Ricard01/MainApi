import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '../../app.config';
import { HttpClient } from '@angular/common/http';
import { Producto } from '../models/producto.model';

@Injectable({
  providedIn: 'root',
})
export class ProductoApi {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL) + '/productos';

  getAll() {
    return this.http.get<Producto[]>(`${this.baseUrl}`);
  }
}
