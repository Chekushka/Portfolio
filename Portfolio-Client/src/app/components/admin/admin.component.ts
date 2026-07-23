import { Component, computed, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormGroup, FormControl, Validators } from '@angular/forms';
import { forkJoin } from 'rxjs';
import { ProjectService, Project, ProjectRequest } from '../../services/project.service';
import { ProfileService, UserProfile } from '../../services/profile.service';
import { TagService, Tag, TagRequest } from '../../services/tag.service';
import { ContactMethodService, ContactMethod, ContactMethodRequest } from '../../services/contact-method.service';
import { MarkdownEditorComponent } from '../markdown-editor/markdown-editor.component';
import { IconPickerComponent, IconSelection } from '../icon-picker/icon-picker.component';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, MarkdownEditorComponent, IconPickerComponent],
  templateUrl: './admin.component.html',
  styleUrl: './admin.component.scss'
})
export class AdminComponent implements OnInit {
  private projectService = inject(ProjectService);
  private profileService = inject(ProfileService);
  private tagService = inject(TagService);
  private contactMethodService = inject(ContactMethodService);

  activeTab = signal<'profile' | 'projects' | 'tags' | 'contact'>('projects');
  profiles = signal<UserProfile[]>([]);
  activeProfileSlug = signal<string>('unity');
  activeProfile = computed(() => this.profiles().find(p => p.slug === this.activeProfileSlug()));
  projects = signal<Project[]>([]);
  allTags = signal<Tag[]>([]);
  contactMethods = signal<ContactMethod[]>([]);
  editingProjectId = signal<number | null>(null);
  editingTagId = signal<number | null>(null);
  editingContactId = signal<number | null>(null);
  selectedTagIds = signal<number[]>([]);
  isSubmittingProject = false;
  isSubmittingProfile = false;
  isSubmittingContact = false;

  profileForm = new FormGroup({
    name: new FormControl('', Validators.required),
    role: new FormControl('', Validators.required),
    bio: new FormControl(''),
    photoUrl: new FormControl(''),
    cvUrl: new FormControl(''),
    email: new FormControl('', Validators.email),
    projectsStatLabel: new FormControl(''),
    stat2Label: new FormControl(''),
    stat2Value: new FormControl(''),
    stat3Label: new FormControl(''),
    stat3Value: new FormControl('')
  });

  projectForm = new FormGroup({
    name: new FormControl('', Validators.required),
    description: new FormControl(''),
    downloads: new FormControl('0'),
    videoLayout: new FormControl('above'),
    videoUrl: new FormControl(''),
    marketLink: new FormControl(''),
    previewImageUrl: new FormControl('')
  });

  tagForm = new FormGroup({
    name: new FormControl('', Validators.required),
    color: new FormControl('#3b82f6', Validators.required),
    icon: new FormControl<IconSelection>({ iconKey: null, customIconUrl: null })
  });

  contactForm = new FormGroup({
    label: new FormControl('', Validators.required),
    url: new FormControl('', Validators.required),
    icon: new FormControl<IconSelection>({ iconKey: null, customIconUrl: null })
  });

  ngOnInit(): void {
    this.loadProfiles();
    this.loadTags();
    this.loadContactMethods();
  }

  loadProfiles() {
    forkJoin([
      this.profileService.getBySlug('unity'),
      this.profileService.getBySlug('dotnet')
    ]).subscribe({
      next: ([unity, dotnet]) => {
        this.profiles.set([unity, dotnet]);
        this.profileForm.patchValue(this.activeProfile()!);
        this.loadProjects();
      },
      error: (err) => console.error('Failed to load profiles', err)
    });
  }

  switchProfile(slug: string) {
    this.activeProfileSlug.set(slug);
    this.cancelEdit();
    this.profileForm.patchValue(this.activeProfile()!);
    this.loadProjects();
  }

  loadProjects() {
    const profileId = this.activeProfile()?.id ?? 1;
    this.projectService.getByProfileId(profileId).subscribe({
      next: (data) => this.projects.set(data),
      error: (err) => console.error('Failed to load projects', err)
    });
  }

  loadTags() {
    this.tagService.getTags().subscribe({
      next: (data) => this.allTags.set(data),
      error: (err) => console.error('Failed to load tags', err)
    });
  }

  loadContactMethods() {
    this.contactMethodService.getMethods().subscribe({
      next: (data) => this.contactMethods.set(data),
      error: (err) => console.error('Failed to load contact methods', err)
    });
  }

  onProfileSubmit() {
    if (this.profileForm.invalid || this.isSubmittingProfile) return;
    this.isSubmittingProfile = true;
    const slug = this.activeProfileSlug();
    const { name, role, bio, photoUrl, cvUrl, email, projectsStatLabel, stat2Label, stat2Value, stat3Label, stat3Value } = this.profileForm.value;
    this.profileService.updateBySlug(slug, {
      name: name ?? '',
      role: role ?? '',
      bio: bio ?? '',
      photoUrl: photoUrl ?? '',
      cvUrl: cvUrl ?? '',
      email: email ?? '',
      projectsStatLabel: projectsStatLabel ?? '',
      stat2Label: stat2Label ?? '',
      stat2Value: stat2Value ?? '',
      stat3Label: stat3Label ?? '',
      stat3Value: stat3Value ?? ''
    }).subscribe({
      next: () => { alert('Profile updated successfully!'); this.isSubmittingProfile = false; },
      error: () => { this.isSubmittingProfile = false; }
    });
  }

  onSubmit() {
    if (this.projectForm.invalid || this.isSubmittingProject) return;
    this.isSubmittingProject = true;
    const id = this.editingProjectId();
    const projectData: ProjectRequest = {
      ...(this.projectForm.value as Omit<ProjectRequest, 'tagIds' | 'profileId'>),
      tagIds: this.selectedTagIds(),
      profileId: this.activeProfile()?.id ?? 1
    };
    if (id) {
      this.projectService.updateProject(id, projectData).subscribe({
        next: () => { this.loadProjects(); this.cancelEdit(); this.isSubmittingProject = false; },
        error: () => { this.isSubmittingProject = false; }
      });
    } else {
      this.projectService.addProject(projectData).subscribe({
        next: (newProject) => {
          this.projects.update(items => [...items, newProject]);
          this.cancelEdit();
          this.isSubmittingProject = false;
        },
        error: () => { this.isSubmittingProject = false; }
      });
    }
  }

  editProject(project: Project) {
    this.editingProjectId.set(project.id);
    this.projectForm.patchValue({
      name: project.name,
      description: project.description,
      downloads: project.downloads,
      videoLayout: project.videoLayout,
      videoUrl: project.videoUrl,
      marketLink: project.marketLink,
      previewImageUrl: project.previewImageUrl
    });
    this.selectedTagIds.set(project.tags.map(t => t.id));
    this.activeTab.set('projects');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  cancelEdit() {
    this.editingProjectId.set(null);
    this.selectedTagIds.set([]);
    this.projectForm.reset({ downloads: '0', videoLayout: 'above' });
  }

  deleteProject(id: number) {
    if (confirm('Are you sure you want to delete this project?')) {
      this.projectService.deleteProject(id).subscribe({
        next: () => this.projects.update(items => items.filter(p => p.id !== id)),
        error: (err) => console.error('Delete failed', err)
      });
    }
  }

  toggleTag(id: number) {
    this.selectedTagIds.update(ids =>
      ids.includes(id) ? ids.filter(i => i !== id) : [...ids, id]
    );
  }

  onTagSubmit() {
    if (this.tagForm.invalid) return;
    const { name, color, icon } = this.tagForm.value as { name: string; color: string; icon: IconSelection };
    const tagRequest: TagRequest = {
      name,
      color,
      iconKey: icon?.iconKey ?? null,
      customIconUrl: icon?.customIconUrl ?? null
    };
    const id = this.editingTagId();
    if (id) {
      this.tagService.updateTag(id, tagRequest).subscribe({
        next: () => {
          this.allTags.update(tags => tags.map(t => t.id === id ? { id, ...tagRequest } : t));
          this.cancelTagEdit();
        },
        error: (err) => console.error('Tag operation failed', err)
      });
    } else {
      this.tagService.createTag(tagRequest).subscribe({
        next: (tag) => {
          this.allTags.update(tags => [...tags, tag]);
          this.tagForm.reset({ color: '#3b82f6', icon: { iconKey: null, customIconUrl: null } });
        },
        error: (err) => console.error('Tag operation failed', err)
      });
    }
  }

  editTag(tag: Tag) {
    this.editingTagId.set(tag.id);
    this.tagForm.patchValue({
      name: tag.name,
      color: tag.color,
      icon: { iconKey: tag.iconKey, customIconUrl: tag.customIconUrl }
    });
  }

  cancelTagEdit() {
    this.editingTagId.set(null);
    this.tagForm.reset({ color: '#3b82f6', icon: { iconKey: null, customIconUrl: null } });
  }

  deleteTag(id: number) {
    if (confirm('Delete this tag? It will be removed from all projects.')) {
      this.tagService.deleteTag(id).subscribe({
        next: () => {
          this.allTags.update(tags => tags.filter(t => t.id !== id));
          this.selectedTagIds.update(ids => ids.filter(i => i !== id));
          this.loadProjects();
        }
      });
    }
  }

  onContactSubmit() {
    if (this.contactForm.invalid || this.isSubmittingContact) return;
    this.isSubmittingContact = true;
    const { label, url, icon } = this.contactForm.value as { label: string; url: string; icon: IconSelection };
    const id = this.editingContactId();
    const request: ContactMethodRequest = {
      label,
      url,
      iconKey: icon?.iconKey ?? null,
      customIconUrl: icon?.customIconUrl ?? null,
      order: id
        ? (this.contactMethods().find(m => m.id === id)?.order ?? 0)
        : this.contactMethods().length
    };
    if (id) {
      this.contactMethodService.updateMethod(id, request).subscribe({
        next: () => {
          this.contactMethods.update(methods =>
            methods.map(m => m.id === id ? { ...m, ...request } : m)
          );
          this.cancelContactEdit();
          this.isSubmittingContact = false;
        },
        error: () => { this.isSubmittingContact = false; }
      });
    } else {
      this.contactMethodService.createMethod(request).subscribe({
        next: (method) => {
          this.contactMethods.update(methods => [...methods, method]);
          this.contactForm.reset({ icon: { iconKey: null, customIconUrl: null } });
          this.isSubmittingContact = false;
        },
        error: () => { this.isSubmittingContact = false; }
      });
    }
  }

  editContact(method: ContactMethod) {
    this.editingContactId.set(method.id);
    this.contactForm.patchValue({
      label: method.label,
      url: method.url,
      icon: { iconKey: method.iconKey, customIconUrl: method.customIconUrl }
    });
  }

  cancelContactEdit() {
    this.editingContactId.set(null);
    this.contactForm.reset({ icon: { iconKey: null, customIconUrl: null } });
  }

  deleteContact(id: number) {
    if (confirm('Delete this contact method?')) {
      this.contactMethodService.deleteMethod(id).subscribe({
        next: () => this.contactMethods.update(methods => methods.filter(m => m.id !== id)),
        error: (err) => console.error('Delete contact failed', err)
      });
    }
  }

  moveProject(id: number, direction: 'up' | 'down') {
    this.projectService.reorderProject(id, direction).subscribe({
      next: (updated) => this.projects.set(updated),
      error: (err) => console.error('Reorder failed', err)
    });
  }

  moveContact(index: number, direction: -1 | 1) {
    const methods = [...this.contactMethods()];
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= methods.length) return;
    [methods[index], methods[newIndex]] = [methods[newIndex], methods[index]];
    methods.forEach((m, i) => (m.order = i));
    this.contactMethods.set(methods);
    this.contactMethodService.reorder(methods.map(m => m.id)).subscribe({
      error: (err) => console.error('Reorder failed', err)
    });
  }
}
