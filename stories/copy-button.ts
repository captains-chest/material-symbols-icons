import { ChangeDetectionStrategy, Component, Input, signal } from '@angular/core';
import { MsrCheckIconComponent } from '../projects/material-symbols-rounded-icons/src/lib/icons/generated/check.icon';
import { MsrContentCopyIconComponent } from '../projects/material-symbols-rounded-icons/src/lib/icons/generated/content-copy.icon';
import { copyToClipboard } from './icon-types';

@Component({
  selector: 'msr-sb-copy-button',
  imports: [MsrCheckIconComponent, MsrContentCopyIconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  styles: `
    :host {
      display: inline-flex;
    }

    button {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      padding: 6px 10px;
      border: 1px solid var(--sb-border);
      border-radius: 8px;
      background: var(--sb-surface);
      color: var(--sb-text-muted);
      font: 500 12px/1 var(--sb-font);
      cursor: pointer;
      transition:
        color 120ms,
        border-color 120ms,
        background 120ms;
    }

    button:hover {
      color: var(--sb-text);
      border-color: var(--sb-border-strong);
    }

    button:focus-visible {
      outline: 2px solid var(--sb-accent);
      outline-offset: 2px;
    }

    button.copied {
      color: var(--sb-success);
      border-color: currentColor;
    }

    .icon {
      --msr-icon-size: 16px;
    }
  `,
  template: `
    <button type="button" [class.copied]="copied()" (click)="copy()" [attr.aria-label]="ariaLabel">
      @if (copied()) {
        <msr-check-icon class="icon" />
      } @else {
        <msr-content-copy-icon class="icon" />
      }
      <span>{{ copied() ? 'Copied' : label }}</span>
    </button>
  `,
})
export class CopyButtonComponent {
  // Decorator inputs: Storybook compiles stories in JIT mode, where signal inputs are not registered.
  @Input({ required: true }) text = '';
  @Input() label = 'Copy';
  @Input() ariaLabel: string | null = null;
  protected readonly copied = signal(false);
  private resetTimer?: ReturnType<typeof setTimeout>;

  async copy(): Promise<void> {
    if (!(await copyToClipboard(this.text))) return;
    this.copied.set(true);
    clearTimeout(this.resetTimer);
    this.resetTimer = setTimeout(() => this.copied.set(false), 1600);
  }
}
