import {
  ChangeDetectionStrategy, ChangeDetectorRef, Component,
  forwardRef, inject
} from '@angular/core';
import { ControlValueAccessor, NG_VALUE_ACCESSOR } from '@angular/forms';
import { CommonModule } from '@angular/common';

export interface IconSelection {
  iconKey: string | null;
  customIconUrl: string | null;
}

export const ICONS = [
  'linkedin', 'github', 'telegram', 'whatsapp', 'discord',
  'email', 'instagram', 'x', 'youtube', 'reddit',
  'tiktok', 'phone', 'website', 'twitch', 'vk'
] as const;

@Component({
  selector: 'app-icon-picker',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [CommonModule],
  providers: [{
    provide: NG_VALUE_ACCESSOR,
    useExisting: forwardRef(() => IconPickerComponent),
    multi: true
  }],
  template: `
<div class="icon-picker">
  <div class="icon-grid">
    @for (key of icons; track key) {
      <button type="button" class="icon-btn"
              [class.selected]="value.iconKey === key"
              (click)="selectIcon(key)" [title]="key">
        <img [src]="'/assets/icons/' + key + '.svg'" [alt]="key" width="20" height="20">
      </button>
    }
  </div>
  <input class="icon-url-input" type="text"
         placeholder="Or paste icon URL…"
         [value]="value.customIconUrl ?? ''"
         (input)="onCustomUrl($any($event.target).value)">
</div>
`,
  styles: [`
.icon-picker { display: flex; flex-direction: column; gap: 8px; }
.icon-grid { display: flex; flex-wrap: wrap; gap: 6px; }
.icon-btn {
  width: 36px; height: 36px; border-radius: 6px;
  border: 2px solid var(--g-border);
  background: #fff; cursor: pointer;
  display: flex; align-items: center; justify-content: center;
  padding: 0; transition: border-color 0.15s;
  img { display: block; }
}
.icon-btn:hover { border-color: var(--g-primary); }
.icon-btn.selected { border-color: var(--g-primary); background: oklch(96% 0.04 278); }
.icon-url-input {
  width: 100%; padding: 0.5rem 0.75rem;
  border: 1px solid var(--g-border); border-radius: 8px;
  font-size: 0.875rem; background: #fff; color: var(--g-text);
  box-sizing: border-box; font-family: inherit;
}
.icon-url-input:focus { outline: none; border-color: var(--g-primary); }
  `]
})
export class IconPickerComponent implements ControlValueAccessor {
  private cdr = inject(ChangeDetectorRef);

  readonly icons = ICONS;
  value: IconSelection = { iconKey: null, customIconUrl: null };

  private onChange: (v: IconSelection) => void = () => {};
  private onTouched: () => void = () => {};

  writeValue(v: IconSelection | null): void {
    this.value = v ?? { iconKey: null, customIconUrl: null };
    this.cdr.markForCheck();
  }

  registerOnChange(fn: (v: IconSelection) => void): void { this.onChange = fn; }
  registerOnTouched(fn: () => void): void { this.onTouched = fn; }

  selectIcon(key: string): void {
    this.value = { iconKey: key, customIconUrl: null };
    this.onChange(this.value);
    this.onTouched();
    this.cdr.markForCheck();
  }

  onCustomUrl(url: string): void {
    this.value = { iconKey: null, customIconUrl: url || null };
    this.onChange(this.value);
    this.onTouched();
    this.cdr.markForCheck();
  }
}
