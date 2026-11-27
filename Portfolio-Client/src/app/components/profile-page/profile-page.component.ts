import {
  Component, ElementRef, Renderer2,
  inject, OnInit, OnDestroy, signal, computed, viewChild
} from '@angular/core';
import { DOCUMENT, NgTemplateOutlet } from '@angular/common';
import { Title } from '@angular/platform-browser';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { MarkdownModule } from 'ngx-markdown';

import { ProjectService, Project } from '../../services/project.service';
import { ProfileService, UserProfile } from '../../services/profile.service';
import { ContactMethodService, ContactMethod } from '../../services/contact-method.service';
import { ThemeService } from '../../services/theme.service';
import { SafeUrlPipe } from '../../pipes/safe-url.pipe';
import { getReadableTextColor } from './readable-text-color';

interface FloatingCoin {
  id: number;
  left: number;
  value: number;
  duration: number;
}

// Hardcoded per theme by design (see TASKS.md "Theme-conditional hero badges").
const HIGHLIGHTS: Record<string, string[]> = {
  unity: ['Unity', 'Mobile', '100K+ downloads'],
  dotnet: ['ASP.NET Core', 'EF Core', 'REST APIs'],
};

@Component({
  selector: 'app-profile-page',
  standalone: true,
  imports: [SafeUrlPipe, MarkdownModule, RouterLink, NgTemplateOutlet],
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
  private title = inject(Title);
  private renderer = inject(Renderer2);
  private document = inject(DOCUMENT);

  private projectDialog = viewChild<ElementRef<HTMLDialogElement>>('projectDialog');
  private coinIdCounter = 0;
  private spawnTimeout: ReturnType<typeof setTimeout> | null = null;
  private spawnInterval: ReturnType<typeof setInterval> | null = null;
  private despawnTimeouts = new Map<number, ReturnType<typeof setTimeout>>();
  private bodyThemeClass: string | null = null;
  private defaultTitle = this.title.getTitle();

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
  isLoaded = signal(false);
  projects = signal<Project[]>([]);
  contactMethods = signal<ContactMethod[]>([]);
  selectedProject = signal<Project | null>(null);
  gameScore = signal<number>(0);
  floatingCoins = signal<FloatingCoin[]>([]);

  isUnity = computed(() => this.profile().themeKey === 'unity');
  highlights = computed(() => HIGHLIGHTS[this.profile().themeKey] ?? []);
  // The profile set is fixed at two (seeded), so the "other" profile is always known.
  otherSlug = computed(() => (this.profile().slug === 'dotnet' ? 'unity' : 'dotnet'));

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
        const themeKey = data.themeKey || 'unity';
        this.profile.set(data);
        this.isLoaded.set(true);
        this.applyBodyTheme(themeKey);
        this.themeService.activeTheme.set(themeKey);
        this.title.setTitle([data.name, data.role].filter(Boolean).join(' · ') || this.defaultTitle);
        this.projectService.getByProfileId(data.id).subscribe(p => this.projects.set(p));
        if (themeKey === 'unity') this.startCoinGame();
      },
      error: () => this.router.navigate([''])
    });

    this.contactMethodService.getMethods().subscribe(data => this.contactMethods.set(data));
  }

  ngOnDestroy(): void {
    if (this.spawnTimeout) clearTimeout(this.spawnTimeout);
    if (this.spawnInterval) clearInterval(this.spawnInterval);
    this.despawnTimeouts.forEach(t => clearTimeout(t));
    if (this.bodyThemeClass) {
      this.renderer.removeClass(this.document.body, this.bodyThemeClass);
    }
    this.themeService.activeTheme.set(null);
    this.title.setTitle(this.defaultTitle);
  }

  tagTextColor(color: string): string | null {
    return getReadableTextColor(color);
  }

  scrollToContact(event: Event): void {
    event.preventDefault();
    const contact = this.document.getElementById('contact');
    contact?.scrollIntoView();
    contact?.focus({ preventScroll: true });
  }

  catchCoin(coin: FloatingCoin): void {
    this.gameScore.update(s => s + coin.value);
    this.despawnCoin(coin.id);
    setTimeout(() => this.spawnCoin(), 300);
  }

  formattedScore(): string {
    return this.gameScore().toString().padStart(8, '0');
  }

  openProject(project: Project): void {
    this.selectedProject.set(project);
    this.projectDialog()?.nativeElement.showModal();
  }

  closeProject(): void {
    this.projectDialog()?.nativeElement.close();
  }

  // Fires for the close button, Escape and backdrop clicks alike.
  handleDialogClose(): void {
    this.selectedProject.set(null);
  }

  // The dialog has no padding, so a click whose target is the dialog itself landed on
  // the ::backdrop.
  handleDialogClick(event: MouseEvent): void {
    if (event.target === event.currentTarget) this.closeProject();
  }

  private applyBodyTheme(themeKey: string): void {
    if (this.bodyThemeClass) {
      this.renderer.removeClass(this.document.body, this.bodyThemeClass);
    }
    this.bodyThemeClass = `theme-${themeKey}`;
    this.renderer.addClass(this.document.body, this.bodyThemeClass);
  }

  private startCoinGame(): void {
    this.spawnTimeout = setTimeout(() => this.spawnCoin(), 5000);
    this.spawnInterval = setInterval(() => {
      if (this.floatingCoins().length < 2) this.spawnCoin();
    }, 10000);
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

  private despawnCoin(id: number): void {
    this.floatingCoins.update(coins => coins.filter(c => c.id !== id));
    const t = this.despawnTimeouts.get(id);
    if (t) { clearTimeout(t); this.despawnTimeouts.delete(id); }
  }
}
