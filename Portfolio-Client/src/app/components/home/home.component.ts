import { Component, HostListener, inject, OnInit, OnDestroy, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ProjectService } from '../../services/project.service';
import { ProfileService } from '../../services/profile.service';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { MarkdownModule } from 'ngx-markdown';
import { Tag } from '../../services/tag.service';

interface Project {
  id: number;
  name: string;
  description: string;
  downloads: string;
  videoLayout: string;
  previewImageUrl?: string;
  videoUrl?: string;
  marketLink?: string;
  tags: Tag[];
}

interface Profile {
  name: string;
  role: string;
  bio: string;
  photoUrl: string;
  cvUrl: string;
  email: string;
}

interface FloatingCoin {
  id: number;
  left: number;
  value: number;
  duration: number;
}

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe, MarkdownModule],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss'
})
export class HomeComponent implements OnInit, OnDestroy {
  private projectService = inject(ProjectService);
  private profileService = inject(ProfileService);
  private coinIdCounter = 0;
  private spawnInterval: ReturnType<typeof setInterval> | null = null;
  private despawnTimeouts = new Map<number, ReturnType<typeof setTimeout>>();

  projects = signal<Project[]>([]);
  profile = signal<Profile>({ name: '', role: '', bio: '', photoUrl: '', cvUrl: '', email: '' });
  selectedProject = signal<Project | null>(null);
  gameScore = signal<number>(0);
  floatingCoins = signal<FloatingCoin[]>([]);

  ngOnInit(): void {
    this.projectService.getProjects().subscribe(data => this.projects.set(data));
    this.profileService.getProfile().subscribe(data => { if (data) this.profile.set(data); });

    setTimeout(() => this.spawnCoin(), 5000);

    this.spawnInterval = setInterval(() => {
      if (this.floatingCoins().length < 2) this.spawnCoin();
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.spawnInterval) clearInterval(this.spawnInterval);
    this.despawnTimeouts.forEach(t => clearTimeout(t));
  }

  private spawnCoin(): void {
    const id = ++this.coinIdCounter;
    const duration = 9 + Math.random() * 6;
    const coin: FloatingCoin = {
      id,
      left: 6 + Math.random() * 88,
      value: Math.random() < 0.65 ? 1 : Math.random() < 0.85 ? 3 : 5,
      duration,
    };
    this.floatingCoins.update(coins => [...coins, coin]);
    const timeout = setTimeout(() => this.despawnCoin(id), (duration + 0.5) * 1000);
    this.despawnTimeouts.set(id, timeout);
  }

  catchCoin(coin: FloatingCoin): void {
    this.gameScore.update(s => s + coin.value);
    this.despawnCoin(coin.id);
    setTimeout(() => this.spawnCoin(), 300);
  }

  private despawnCoin(id: number): void {
    this.floatingCoins.update(coins => coins.filter(c => c.id !== id));
    const t = this.despawnTimeouts.get(id);
    if (t) { clearTimeout(t); this.despawnTimeouts.delete(id); }
  }

  formattedScore(): string {
    return this.gameScore().toString().padStart(8, '0');
  }

  openProject(project: Project): void {
    this.selectedProject.set(project);
    document.documentElement.style.overflow = 'hidden';
  }

  closeProject(): void {
    this.selectedProject.set(null);
    document.documentElement.style.overflow = '';
  }

  @HostListener('document:keydown.escape')
  onEscape(): void {
    if (this.selectedProject()) this.closeProject();
  }
}
