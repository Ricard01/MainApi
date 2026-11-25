import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {API_BASE_URL} from '../../app.config';
import {Cliente} from '../models/cliente.model';

@Injectable({
  providedIn: 'root',
})
export class ClienteApi {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL) + '/clientes';

  getAll() {
    return this.http.get<Cliente[]>(this.baseUrl);
  }
}
