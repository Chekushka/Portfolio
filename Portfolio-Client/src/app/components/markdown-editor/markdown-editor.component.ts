import { ChangeDetectionStrategy, ChangeDetectorRef, Component, ElementRef, forwardRef, inject, ViewChild } from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { MarkdownModule } from 'ngx-markdown';

@Component({
  selector: 'app-markdown-editor',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule, MarkdownModule],
  template: `
<div class="md-editor">
  <div class="md-toolbar">
    <button type="button" (click)="insertBold()" title="Bold"><strong>B</strong></button>
    <button type="button" (click)="insertItalic()" title="Italic"><em>I</em></button>
    <button type="button" (click)="insertUl()" title="Unordered list">&#8226;&#8212;</button>
    <button type="button" (click)="insertOl()" title="Ordered list">1.</button>
    <button type="button" (click)="insertCode()" title="Inline code">&#96; &#96;</button>
    <button type="button" (click)="insertCodeBlock()" title="Code block">&#123; &#125;</button>
    <button type="button" (click)="insertLink()" title="Link">&#128279;</button>
    <span class="md-spacer"></span>
    <button type="button" class="md-toggle" (click)="isPreviewing = !isPreviewing">
      {{ isPreviewing ? 'Edit' : 'Preview' }}
    </button>
  </div>

  @if (!isPreviewing) {
    <textarea
      #textarea
      class="md-textarea"
      [value]="value"
      (input)="onInput($event)"
      rows="8"
      placeholder="Write description in Markdown...">
    </textarea>
  } @else {
    <div class="md-preview">
      <markdown [data]="value" />
    </div>
  }
</div>
  `,
  styles: [`
.md-editor {
  display: flex;
  flex-direction: column;
  border: 1px solid var(--border, #374151);
  border-radius: 6px;
  overflow: hidden;
}
.md-toolbar {
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 6px 8px;
  background: var(--surface-2, #1f2937);
  border-bottom: 1px solid var(--border, #374151);
  flex-wrap: wrap;
}
.md-toolbar button {
  min-width: 32px;
  height: 28px;
  padding: 0 6px;
  background: var(--surface-3, #374151);
  color: var(--text, #f9fafb);
  border: 1px solid var(--border, #4b5563);
  border-radius: 4px;
  cursor: pointer;
  font-size: 0.8rem;
  line-height: 1;
}
.md-toolbar button:hover { background: var(--surface-4, #4b5563); }
.md-spacer { flex: 1; }
.md-toggle { font-size: 0.75rem; padding: 0 10px; }
.md-textarea {
  width: 100%;
  min-height: 180px;
  padding: 12px;
  background: var(--surface-1, #111827);
  color: var(--text, #f9fafb);
  border: none;
  resize: vertical;
  font-family: monospace;
  font-size: 0.875rem;
  line-height: 1.6;
  box-sizing: border-box;
}
.md-textarea:focus { outline: none; }
.md-preview {
  min-height: 180px;
  padding: 12px;
  background: var(--surface-1, #111827);
  color: var(--text, #f9fafb);
  font-size: 0.875rem;
  line-height: 1.6;
}
  `],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => MarkdownEditorComponent),
    multi: true
  }]
})
export class MarkdownEditorComponent implements ControlValueAccessor {
  @ViewChild('textarea') textareaRef!: ElementRef<HTMLTextAreaElement>;
  private readonly cdr = inject(ChangeDetectorRef);

  value = '';
  private _isPreviewing = false;
  get isPreviewing(): boolean { return this._isPreviewing; }
  set isPreviewing(val: boolean) {
    this._isPreviewing = val;
    this.cdr.markForCheck();
  }
  private onChange: (val: string) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(val: string): void { this.value = val ?? ''; }
  registerOnChange(fn: (val: string) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  onInput(event: Event): void {
    this.value = (event.target as HTMLTextAreaElement).value;
    this.onChange(this.value);
    this.onTouched();
  }

  insertBold(): void { this.insert('**', '**'); }
  insertItalic(): void { this.insert('_', '_'); }
  insertUl(): void { this.insert('\n- '); }
  insertOl(): void { this.insert('\n1. '); }
  insertCode(): void { this.insert('`', '`'); }
  insertCodeBlock(): void { this.insert('\n```\n', '\n```'); }
  insertLink(): void { this.insert('[', '](url)'); }

  insert(before: string, after = ''): void {
    if (this.isPreviewing) return;
    const el = this.textareaRef.nativeElement;
    const start = el.selectionStart;
    const end = el.selectionEnd;
    const selected = this.value.substring(start, end) || 'text';
    const inserted = `${before}${selected}${after}`;
    this.value = this.value.substring(0, start) + inserted + this.value.substring(end);
    this.onChange(this.value);
    setTimeout(() => {
      el.focus();
      el.setSelectionRange(start + before.length, start + before.length + selected.length);
    });
  }
}
