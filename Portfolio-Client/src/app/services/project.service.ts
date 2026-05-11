import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
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
  tagIds: number[];
}

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = `${API_CONFIG.baseUrl}/${API_CONFIG.endpoints.project}`;

  getProjects() {
    return this.http.get<Project[]>(this.apiUrl);
  }

  addProject(project: ProjectRequest) {
    return this.http.post<Project>(this.apiUrl, project);
  }

  deleteProject(id: number) {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }

  updateProject(id: number, project: ProjectRequest) {
    return this.http.put<void>(`${this.apiUrl}/${id}`, project);
  }
}
