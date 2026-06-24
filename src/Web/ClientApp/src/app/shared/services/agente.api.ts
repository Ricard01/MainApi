import { inject, Injectable } from '@angular/core';
import { API_BASE_URL } from '../../app.config';
import { HttpClient } from '@angular/common/http';
import { Agente } from '../models/agente.model';

@Injectable({
  providedIn: 'root',
})
export class AgenteApi {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL) + '/agentes';

  getAll() {
    return this.http.get<Agente[]>(`${this.baseUrl}`);
  }
}
