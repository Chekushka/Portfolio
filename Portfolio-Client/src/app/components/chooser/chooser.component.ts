import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { ProfileService, UserProfile } from '../../services/profile.service';

@Component({
  selector: 'app-chooser',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './chooser.component.html',
  styleUrl: './chooser.component.scss'
})
export class ChooserComponent implements OnInit {
  private router = inject(Router);
  private profileService = inject(ProfileService);

  unityProfile = signal<UserProfile | null>(null);
  dotnetProfile = signal<UserProfile | null>(null);
  hoveredSlug = signal<string | null>(null);

  ngOnInit(): void {
    this.profileService.getBySlug('unity').subscribe(p => this.unityProfile.set(p));
    this.profileService.getBySlug('dotnet').subscribe(p => this.dotnetProfile.set(p));
  }

  navigate(slug: string): void {
    this.router.navigate([slug]);
  }
}
