import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '../../../app.config';
import { ContpaqiConexion } from './contpaqi.model';

@Injectable({
  providedIn: 'root',
})
export class ContpaqiApi {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL) + '/conexion/contpaqi';

  get() {
    return this.http.get<ContpaqiConexion>(this.baseUrl);
  }

  save(command: ContpaqiConexion) {
    return this.http.post<void>(this.baseUrl, command);
  }
}
