import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';

export interface ContactMethod {
  id: number;
  label: string;
  iconKey: string | null;
  customIconUrl: string | null;
  url: string;
  order: number;
}

export interface ContactMethodRequest {
  label: string;
  iconKey: string | null;
  customIconUrl: string | null;
  url: string;
  order: number;
}

@Injectable({ providedIn: 'root' })
export class ContactMethodService {
  private http = inject(HttpClient);
  private baseUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.contactMethods}`;

  getMethods(): Observable<ContactMethod[]> {
    return this.http.get<ContactMethod[]>(this.baseUrl);
  }

  createMethod(r: ContactMethodRequest): Observable<ContactMethod> {
    return this.http.post<ContactMethod>(this.baseUrl, r);
  }

  updateMethod(id: number, r: ContactMethodRequest): Observable<ContactMethod> {
    return this.http.put<ContactMethod>(`${this.baseUrl}/${id}`, r);
  }

  deleteMethod(id: number): Observable<void> {
    return this.http.delete<void>(`${this.baseUrl}/${id}`);
  }

  reorder(ids: number[]): Observable<void> {
    return this.http.put<void>(`${this.baseUrl}/reorder`, ids);
  }
}
