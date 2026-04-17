import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {API_BASE_URL} from '../../../app.config';
import {UserListItem} from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserApi {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL) + '/user';

  getAll() {
    return this.http.get<UserListItem[]>(`${this.baseUrl}`);
  }

}
