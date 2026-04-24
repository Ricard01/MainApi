import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {API_BASE_URL} from '../../../app.config';
import {Rol, RolListItem} from './rol.model';
import {IdentityResult} from '../../usuarios/data-access/user.model';

@Injectable({
  providedIn: 'root'
})
export class RolApi {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL) + '/rol';

  getAll() {
    return this.http.get<RolListItem[]>(`${this.baseUrl}`);
  }

  getById(id: string) {
    return this.http.get<Rol>(`${this.baseUrl}/${id}`);
  }

  delete(id: string) {
    return this.http.delete<IdentityResult>(`${this.baseUrl}/${id}`);
  }
}
