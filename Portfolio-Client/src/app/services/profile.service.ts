import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.profile}`;

  getProfile(): Observable<any> {
    return this.http.get(this.apiUrl);
  }

  updateProfile(profileData: any): Observable<any> {
    return this.http.put(this.apiUrl, profileData);
  }
}
