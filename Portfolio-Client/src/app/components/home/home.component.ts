import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { ProfileService } from '../../services/profile.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit {
  private projectService = inject(ProjectService);
  private profileService = inject(ProfileService);

  projects = signal<any[]>([]);

  // Use a signal for the profile to handle async DB data seamlessly
  profile = signal<any>({
    name: '', role: '', bio: '', photoUrl: '', cvUrl: '', email: ''
  });

  selectedProject = signal<any | null>(null);

  // Global mini-game state
  gameScore = signal<number>(0);
  coinPosition = signal({ top: '50vh', left: '50vw' });

  ngOnInit(): void {
    // Load projects
    this.projectService.getProjects().subscribe(data => this.projects.set(data));

    // Load profile from database
    this.profileService.getProfile().subscribe(data => {
      if (data) this.profile.set(data);
    });

    // Set initial coin position
    this.moveCoinRandomly();
  }

  openProject(project: any) {
    this.selectedProject.set(project);
    document.documentElement.style.overflow = 'hidden';
  }

  closeProject() {
    this.selectedProject.set(null);
    document.documentElement.style.overflow = 'auto';
  }

  // Mini-game logic
  catchCoin() {
    this.gameScore.update(s => s + 1);
    this.moveCoinRandomly();
  }

  private moveCoinRandomly() {
    // Generate random position between 10% and 90% of viewport width/height
    // to ensure the coin doesn't spawn off-screen
    const randomTop = Math.floor(Math.random() * 90) + 5;
    const randomLeft = Math.floor(Math.random() * 90) + 5;

    // Use vh (viewport height) and vw (viewport width)
    this.coinPosition.set({ top: `${randomTop}%`, left: `${randomLeft}%` });
  }
}
