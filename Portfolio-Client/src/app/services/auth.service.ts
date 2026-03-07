import {inject, Injectable, signal} from '@angular/core';
import {Observable, tap} from 'rxjs';
import {HttpClient} from '@angular/common/http';

@Injectable({ providedIn: 'root' })
export class AuthService {
  // Signal to track if user is logged in
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5177/api/auth';
  isLoggedIn = signal<boolean>(!!localStorage.getItem('token'));

  login(credentials: any): Observable<any> {
    return this.http.post<{token: string}>(`${this.apiUrl}/login`, credentials).pipe(
      tap(response => {
        localStorage.setItem('token', response.token);
        this.isLoggedIn.set(true);
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this.isLoggedIn.set(false);
  }

  getToken() {
    return localStorage.getItem('token');
  }
}
