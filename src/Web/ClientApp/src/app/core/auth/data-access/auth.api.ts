import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import {AuthUser, LoginCommand} from './auth.models';
import {API_BASE_URL} from "../../../app.config";


@Injectable({ providedIn: 'root' })
export class AuthApi {

  private http = inject(HttpClient);
  private baseUrl = inject(API_BASE_URL);

  login(cmd: LoginCommand): Observable<AuthUser> {
    return this.http.post<AuthUser>(`${this.baseUrl}/auth/login`, cmd );
  }

  /** QUERY: devuelve la sesión actual (si la cookie es válida). */
  me(): Observable<AuthUser> {
    return this.http.get<AuthUser>(`${this.baseUrl}/auth/me`);
  }

  logout(): Observable<void> {
    return this.http.post<void>(`${this.baseUrl}/auth/logout`, {});
  }
}
