import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { ProjectService } from '../../services/project.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private projectService = inject(ProjectService);
  private profileService = inject(ProfileService);

  projects = signal<any[]>([]);
  editingProjectId = signal<number | null>(null);
  isSubmittingProject = false;
  isSubmittingProfile = false;

  // Extended form with new fields for the portfolio
  profileForm = new FormGroup({
    name: new FormControl('', Validators.required),
    role: new FormControl('', Validators.required),
    bio: new FormControl(''),
    photoUrl: new FormControl(''),
    cvUrl: new FormControl(''),
    email: new FormControl('', Validators.email)
  });

  projectForm = new FormGroup({
    name: new FormControl('', Validators.required),
    platform: new FormControl('Google Play', Validators.required),
    genre: new FormControl(''),
    downloads: new FormControl('0'),
    description: new FormControl(''),
    videoUrl: new FormControl(''),
    previewImageUrl: new FormControl(''),
    marketLink: new FormControl('')
  });

  ngOnInit(): void {
    this.loadProjects();
    this.loadProfile();
  }

  loadProjects() {
    this.projectService.getProjects().subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('Failed to load projects', err)
    });
  }

  loadProfile() {
    this.profileService.getProfile().subscribe({
      next: (data) => {
        if (data) this.profileForm.patchValue(data);
      },
      error: (err) => console.error('Failed to load profile', err)
    });
  }

  onProfileSubmit() {
    if (this.profileForm.invalid || this.isSubmittingProfile) return;
    this.isSubmittingProfile = true;

    this.profileService.updateProfile(this.profileForm.value).subscribe({
      next: () => {
        alert('Profile updated successfully!');
        this.isSubmittingProfile = false;
      },
      error: () => this.isSubmittingProfile = false
    });
  }

  onSubmit() {
    if (this.projectForm.invalid || this.isSubmittingProject) return;

    this.isSubmittingProject = true;
    const id = this.editingProjectId();
    const projectData = { ...this.projectForm.value, id: id };

    if (id) {
      // Update existing project
      this.projectService.updateProject(id, projectData).subscribe({
        next: () => {
          this.projects.update(items => items.map(p => p.id === id ? projectData : p));
          this.cancelEdit();
          this.isSubmittingProject = false;
        },
        error: () => this.isSubmittingProject = false
      });
    } else {
      // Create new project
      this.projectService.addProject(this.projectForm.value).subscribe({
        next: (newProject) => {
          this.projects.update(items => [...items, newProject]);
          this.cancelEdit();
          this.isSubmittingProject = false;
        },
        error: () => this.isSubmittingProject = false
      });
    }
  }

  editProject(project: any) {
    this.editingProjectId.set(project.id);
    this.projectForm.patchValue(project);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingProjectId.set(null);
    this.projectForm.reset({ platform: 'Google Play', downloads: '0' });
  }

  deleteProject(id: number) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(id).subscribe({
        next: () => this.projects.update(items => items.filter(p => p.id !== id)),
        error: (err) => console.error('Delete failed', err)
      });
    }
  }
}
