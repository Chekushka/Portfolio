import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface UserProfile {
  id: number;
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  cvUrl: string;
  email: string;
  slug: string;
  themeKey: string;
  projectsStatLabel: string | null;
  stat2Label: string | null;
  stat2Value: string | null;
  stat3Label: string | null;
  stat3Value: string | null;
}

@Injectable({ providedIn: 'root' })
export class ProfileService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.profile}`;

  getProfile(): Observable<UserProfile> {
    return this.http.get<UserProfile>(this.apiUrl);
  }

  getBySlug(slug: string): Observable<UserProfile> {
    return this.http.get<UserProfile>(`${this.apiUrl}/${slug}`);
  }

  updateProfile(profileData: Partial<UserProfile>): Observable<void> {
    return this.http.put<void>(this.apiUrl, profileData);
  }

  updateBySlug(slug: string, profileData: Partial<UserProfile>): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${slug}`, profileData);
  }
}
