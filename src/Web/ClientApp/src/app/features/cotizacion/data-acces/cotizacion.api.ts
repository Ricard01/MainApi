import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {API_BASE_URL} from '../../../app.config';
import {Folio} from '../../../shared/models/folio.model';

@Injectable({providedIn: 'root'})

export class CotizacionApi {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL) + '/cotizaciones';

  getFolio() {
    return this.http.get<Folio>(`${this.baseUrl}/folio`);
  }

}
