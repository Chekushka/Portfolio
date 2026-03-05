import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ProjectService {
  private http = inject(HttpClient);
  private apiUrl = 'http://localhost:5177/api/Project';

  getProjects() {
    return this.http.get<any[]>(this.apiUrl);
  }

  addProject(project: any) {
    return this.http.post<any>(this.apiUrl, project);
  }

  deleteProject(id: number) {
    // Додаємо id до URL через слеш
    return this.http.delete(`${this.apiUrl}/${id}`);
  }

  updateProject(id: number, project: any) {
    return this.http.put(`${this.apiUrl}/${id}`, project);
  }
}
