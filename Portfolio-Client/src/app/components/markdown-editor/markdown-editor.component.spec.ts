import { ComponentFixture, TestBed } from '@angular/core/testing';
import { MarkdownEditorComponent } from './markdown-editor.component';
import { provideMarkdown } from 'ngx-markdown';
import { provideHttpClient } from '@angular/common/http';

describe('MarkdownEditorComponent', () => {
  let fixture: ComponentFixture<MarkdownEditorComponent>;
  let component: MarkdownEditorComponent;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [MarkdownEditorComponent],
      providers: [provideHttpClient(), provideMarkdown()]
    }).compileComponents();
    fixture = TestBed.createComponent(MarkdownEditorComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('writeValue sets value', () => {
    component.writeValue('**hello**');
    expect(component.value).toBe('**hello**');
  });

  it('writeValue treats null as empty string', () => {
    component.writeValue(null as any);
    expect(component.value).toBe('');
  });

  it('toggles to preview mode', () => {
    component.isPreviewing = true;
    fixture.detectChanges();
    const preview = fixture.nativeElement.querySelector('.md-preview');
    expect(preview).toBeTruthy();
  });

  it('shows textarea in edit mode', () => {
    component.isPreviewing = false;
    fixture.detectChanges();
    const textarea = fixture.nativeElement.querySelector('textarea');
    expect(textarea).toBeTruthy();
  });
});
