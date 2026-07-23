import {
  Component, HostListener, Renderer2,
  inject, OnInit, OnDestroy, signal, computed
} from '@angular/core';
import { CommonModule, DOCUMENT } from '@angular/common';
import { ActivatedRoute, Router } from '@angular/router';
import { ProjectService, Project } from '../../services/project.service';
import { ProfileService, UserProfile } from '../../services/profile.service';
import { ContactMethodService, ContactMethod } from '../../services/contact-method.service';
import { ThemeService } from '../../services/theme.service';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { MarkdownModule } from 'ngx-markdown';

interface FloatingCoin {
  id: number;
  left: number;
  value: number;
  duration: number;
}

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [CommonModule, SafeUrlPipe, MarkdownModule],
  templateUrl: './profile-page.component.html',
  styleUrl: './profile-page.component.scss'
})
export class ProfilePageComponent implements OnInit, OnDestroy {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private projectService = inject(ProjectService);
  private profileService = inject(ProfileService);
  private contactMethodService = inject(ContactMethodService);
  private themeService = inject(ThemeService);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  private coinIdCounter = 0;
  private spawnInterval: ReturnType<typeof setInterval> | null = null;
  private despawnTimeouts = new Map<number, ReturnType<typeof setTimeout>>();
  private bodyThemeClass: string | null = null;

  profile = signal<UserProfile>({
    id: 0,
    name: '',
    role: '',
    bio: '',
    photoUrl: '',
    cvUrl: '',
    email: '',
    slug: '',
    themeKey: 'unity',
    projectsStatLabel: null,
    stat2Label: null,
    stat2Value: null,
    stat3Label: null,
    stat3Value: null,
  });
  projects = signal<Project[]>([]);
  contactMethods = signal<ContactMethod[]>([]);
  selectedProject = signal<Project | null>(null);
  gameScore = signal<number>(0);
  floatingCoins = signal<FloatingCoin[]>([]);

  isUnity = computed(() => this.profile().themeKey === 'unity');

  projectCount = computed(() => this.projects().length);

  heroStats = computed<{ label: string; value: string }[]>(() => {
    const p = this.profile();
    const stats: { label: string; value: string }[] = [];
    if (p.projectsStatLabel && this.projectCount() > 0) {
      stats.push({
        label: p.projectsStatLabel,
        value: `${this.projectCount()}+`,
      });
    }
    if (p.stat2Label && p.stat2Value) {
      stats.push({ label: p.stat2Label, value: p.stat2Value });
    }
    if (p.stat3Label && p.stat3Value) {
      stats.push({ label: p.stat3Label, value: p.stat3Value });
    }
    return stats;
  });

  ngOnInit(): void {
    const slug = this.route.snapshot.paramMap.get('slug') ?? '';
    this.profileService.getBySlug(slug).subscribe({
      next: (data) => {
        this.profile.set(data);
        this.applyBodyTheme(data.themeKey || 'unity');
        this.themeService.activeTheme.set(data.themeKey || 'unity');
        this.projectService.getByProfileId(data.id).subscribe(p => this.projects.set(p));
      },
      error: () => this.router.navigate([''])
    });

    this.contactMethodService.getMethods().subscribe(data => this.contactMethods.set(data));

    setTimeout(() => this.spawnCoin(), 5000);
    this.spawnInterval = setInterval(() => {
      if (this.floatingCoins().length < 2) this.spawnCoin();
    }, 10000);
  }

  ngOnDestroy(): void {
    if (this.spawnInterval) clearInterval(this.spawnInterval);
    this.despawnTimeouts.forEach(t => clearTimeout(t));
    if (this.bodyThemeClass) {
      this.renderer.removeClass(this.document.body, this.bodyThemeClass);
    }
    this.themeService.activeTheme.set(null);
  }

  private applyBodyTheme(themeKey: string): void {
    if (this.bodyThemeClass) {
      this.renderer.removeClass(this.document.body, this.bodyThemeClass);
    }
    this.bodyThemeClass = `theme-${themeKey}`;
    this.renderer.addClass(this.document.body, this.bodyThemeClass);
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
