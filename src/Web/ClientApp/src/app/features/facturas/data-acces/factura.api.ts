import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {API_BASE_URL} from '../../../app.config';
import {Folio} from '../../../shared/models/folio.model';

import {HttpParams} from '@angular/common/http';
import {
  DocumentoListItem,
  DocumentoListQuery,
  PaginatedResponse
} from '../../../shared/models/documento-list.model';
import {CreateFacturaCommand, FacturaReadModel} from './factura.model';

@Injectable({providedIn: 'root'})

export class FacturaApi {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL) + '/facturas';


  getFolio() {
    return this.http.get<Folio>(`${this.baseUrl}/folio`);
  }

  create( command: CreateFacturaCommand){
    return this.http.post<number>(this.baseUrl, command);
  }

  update(id: number, command: CreateFacturaCommand) {
    return this.http.put<number>(`${this.baseUrl}/${id}`, {...command, id});
  }

  delete(id: number) {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  list(query: DocumentoListQuery) {
    let params = new HttpParams()
      .set('page', query.page)
      .set('pageSize', query.pageSize)
      .set('sortBy', query.sortBy)
      .set('sortDirection', query.sortDirection);

    if (query.search) params = params.set('search', query.search);
    if (query.dateFrom) params = params.set('dateFrom', query.dateFrom);
    if (query.dateTo) params = params.set('dateTo', query.dateTo);
    if (query.status) params = params.set('status', query.status);

    return this.http.get<PaginatedResponse<DocumentoListItem>>(this.baseUrl, {params});
  }

  getById(id: number) {
    return this.http.get<FacturaReadModel>(`${this.baseUrl}/${id}`);
  }

}
