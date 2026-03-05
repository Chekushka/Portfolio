import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private projectService = inject(ProjectService);

  // Signal to store the list of public projects
  projects = signal<any[]>([]);

  ngOnInit(): void {
    // Fetch projects when the public page loads
    this.projectService.getProjects().subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('Error fetching projects:', err)
    });
  }
}
