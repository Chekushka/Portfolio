import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { API_CONFIG } from '../config/api.config';

export interface Tag {
  id: number;
  name: string;
  color: string;
}

@Injectable({ providedIn: 'root' })
export class TagService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.tags}`;

  getTags() {
    return this.http.get<Tag[]>(this.apiUrl);
  }

  createTag(tag: Omit<Tag, 'id'>) {
    return this.http.post<Tag>(this.apiUrl, tag);
  }

  updateTag(id: number, tag: Omit<Tag, 'id'>) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, { id, ...tag });
  }

  deleteTag(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
