import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { API_CONFIG } from '../config/api.config';
import { Tag } from './tag.service';

export interface Project {
  id: number;
  name: string;
  description: string;
  downloads: string;
  videoLayout: string;
  videoUrl?: string;
  marketLink?: string;
  previewImageUrl?: string;
  profileId: number;
  order: number;
  tags: Tag[];
}

export interface ProjectRequest {
  name: string;
  description: string;
  downloads: string;
  videoLayout: string;
  videoUrl?: string;
  marketLink?: string;
  previewImageUrl?: string;
  profileId: number;
  tagIds: number[];
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.project}`;

  getProjects(): Observable<Project[]> {
    return this.http.get<Project[]>(this.apiUrl);
  }

  getByProfileId(profileId: number): Observable<Project[]> {
    return this.http.get<Project[]>(`${this.apiUrl}?profileId=${profileId}`);
  }

  addProject(project: ProjectRequest): Observable<Project> {
    return this.http.post<Project>(this.apiUrl, project);
  }

  updateProject(id: number, project: ProjectRequest): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${id}`, project);
  }

  deleteProject(id: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  reorderProject(id: number, direction: 'up' | 'down'): Observable<Project[]> {
    return this.http.put<Project[]>(`${this.apiUrl}/${id}/order`, { direction });
  }
}
