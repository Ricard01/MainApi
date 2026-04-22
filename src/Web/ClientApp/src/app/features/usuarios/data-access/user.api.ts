import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {API_BASE_URL} from '../../../app.config';
import {CreateUserCommand, IdentityResult, UpdateUserCommand, User, UserListItem} from './user.model';

@Injectable({
  providedIn: 'root'
})
export class UserApi {
  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL) + '/user';

  getAll() {
    return this.http.get<UserListItem[]>(`${this.baseUrl}`);
  }

  getById(id: string) {
    return this.http.get<User>(`${this.baseUrl}/${id}`);
  }

  create(command: CreateUserCommand) {
    return this.http.post<IdentityResult>(this.baseUrl, command);
  }

  update(id: string, command: UpdateUserCommand) {
    return this.http.put<IdentityResult>(`${this.baseUrl}/${id}`, command);
  }

  delete(id: string) {
    return this.http.delete<IdentityResult>(`${this.baseUrl}/${id}`);
  }

}
