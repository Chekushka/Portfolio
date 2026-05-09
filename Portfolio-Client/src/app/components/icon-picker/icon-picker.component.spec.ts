import { TestBed } from '@angular/core/testing';
import { Component } from '@angular/core';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { IconPickerComponent, IconSelection } from './icon-picker.component';

@Component({
  standalone: true,
  imports: [IconPickerComponent, ReactiveFormsModule],
  template: `<app-icon-picker [formControl]="ctrl" />`
})
class HostComponent {
  ctrl = new FormControl<IconSelection>({ iconKey: null, customIconUrl: null });
}

describe('IconPickerComponent', () => {
  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [HostComponent]
    }).compileComponents();
  });

  it('selecting predefined icon sets iconKey and clears customIconUrl', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const picker = fixture.debugElement.query(
      e => e.componentInstance instanceof IconPickerComponent
    ).componentInstance as IconPickerComponent;

    picker.selectIcon('github');
    expect(host.ctrl.value).toEqual({ iconKey: 'github', customIconUrl: null });
  });

  it('typing custom URL clears iconKey', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const picker = fixture.debugElement.query(
      e => e.componentInstance instanceof IconPickerComponent
    ).componentInstance as IconPickerComponent;

    picker.selectIcon('github');
    picker.onCustomUrl('https://example.com/icon.svg');
    expect(host.ctrl.value).toEqual({ iconKey: null, customIconUrl: 'https://example.com/icon.svg' });
  });

  it('writeValue populates the component value', () => {
    const fixture = TestBed.createComponent(HostComponent);
    fixture.detectChanges();
    const host = fixture.componentInstance;
    const picker = fixture.debugElement.query(
      e => e.componentInstance instanceof IconPickerComponent
    ).componentInstance as IconPickerComponent;

    host.ctrl.setValue({ iconKey: 'linkedin', customIconUrl: null });
    fixture.detectChanges();
    expect(picker.value).toEqual({ iconKey: 'linkedin', customIconUrl: null });
  });
});
