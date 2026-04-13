// import { Injectable } from '@angular/core';
//
// const K = { token: 'auth_access_token', refresh: 'auth_refresh_token' };
//
// @Injectable({ providedIn: 'root' })
// export class AuthStorageService {
//   get accessToken(): string | null { return localStorage.getItem(K.token); }
//   set accessToken(v: string | null) {
//     if (v) localStorage.setItem(K.token, v); else localStorage.removeItem(K.token);
//   }
//   get refreshToken(): string | null { return localStorage.getItem(K.refresh); }
//   set refreshToken(v: string | null) {
//     if (v) localStorage.setItem(K.refresh, v); else localStorage.removeItem(K.refresh);
//   }
//   clear() { this.accessToken = null; this.refreshToken = null; }
// }
