import { NgComponentOutlet } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  DestroyRef,
  Directive,
  effect,
  ElementRef,
  EventEmitter,
  inject,
  Output,
  signal,
  ViewChild,
} from '@angular/core';
import type { Meta, StoryObj } from '@storybook/angular';
import { MSO_ICON_NAMES as OUTLINED_ICON_NAMES } from '../projects/material-symbols-outlined-icons/src/lib/icons';
import { MSO_ICON_NAMES as OUTLINED_FILLED_ICON_NAMES } from '../projects/material-symbols-outlined-icons-filled/src/lib/icons';
import { MSR_ICON_NAMES as ROUNDED_ICON_NAMES } from '../projects/material-symbols-rounded-icons/src/lib/icons';
import { MsrCloseIconComponent } from '../projects/material-symbols-rounded-icons/src/lib/icons/generated/close.icon';
import { MsrSearchIconComponent } from '../projects/material-symbols-rounded-icons/src/lib/icons/generated/search.icon';
import { MSR_ICON_NAMES as ROUNDED_FILLED_ICON_NAMES } from '../projects/material-symbols-rounded-icons-filled/src/lib/icons';
import { MSS_ICON_NAMES as SHARP_ICON_NAMES } from '../projects/material-symbols-sharp-icons/src/lib/icons';
import { MSS_ICON_NAMES as SHARP_FILLED_ICON_NAMES } from '../projects/material-symbols-sharp-icons-filled/src/lib/icons';
import { CopyButtonComponent } from './copy-button';
import { ICON_GROUP_LOADERS } from './generated/icon-groups';
import {
  iconGroupOf,
  iconStoryId,
  PACKAGES,
  storyHref,
  STYLES,
  type IconGroup,
  type IconStyle,
} from './icon-types';

type FillMode = 'unfilled' | 'filled' | 'both';

const PAGE_SIZE = 180;
const SIZES = [24, 32, 48] as const;
const FILL_MODES: { value: FillMode; label: string }[] = [
  { value: 'unfilled', label: 'Unfilled' },
  { value: 'filled', label: 'Filled' },
  { value: 'both', label: 'Both' },
];

const sortedUnion = (...lists: readonly (readonly string[])[]): readonly string[] =>
  [...new Set(lists.flat())].sort((a, b) => a.localeCompare(b));

const NAMES_BY_STYLE: Record<IconStyle, readonly string[]> = {
  rounded: sortedUnion(ROUNDED_ICON_NAMES, ROUNDED_FILLED_ICON_NAMES),
  outlined: sortedUnion(OUTLINED_ICON_NAMES, OUTLINED_FILLED_ICON_NAMES),
  sharp: sortedUnion(SHARP_ICON_NAMES, SHARP_FILLED_ICON_NAMES),
};

// Storybook compiles stories in JIT mode, which does not register signal-based inputs, outputs or
// queries, so this file uses the decorator APIs for them.

/** Emits when the element scrolls near the viewport; drives incremental rendering. */
@Directive({ selector: '[msrSbInView]' })
class InViewDirective {
  @Output() readonly msrSbInView = new EventEmitter<void>();

  constructor() {
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) this.msrSbInView.emit();
      },
      { rootMargin: '800px 0px' },
    );
    observer.observe(inject(ElementRef).nativeElement);
    inject(DestroyRef).onDestroy(() => observer.disconnect());
  }
}

@Component({
  selector: 'msr-sb-catalog',
  imports: [
    NgComponentOutlet,
    CopyButtonComponent,
    InViewDirective,
    MsrSearchIconComponent,
    MsrCloseIconComponent,
  ],
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { '(document:keydown)': 'onKeydown($event)' },
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      background: var(--sb-bg);
      color: var(--sb-text);
      font-family: var(--sb-font);
    }

    .container {
      max-width: 1280px;
      margin: 0 auto;
      padding: 0 clamp(16px, 4vw, 40px);
    }

    .hero {
      padding: 48px 0 32px;
      background:
        radial-gradient(1200px 300px at 10% -10%, var(--sb-accent-soft), transparent 70%),
        var(--sb-bg);
    }

    .eyebrow {
      margin: 0 0 12px;
      color: var(--sb-accent);
      font-size: 13px;
      font-weight: 600;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }

    h1 {
      margin: 0;
      font-size: clamp(32px, 5vw, 48px);
      font-weight: 700;
      letter-spacing: -0.03em;
      line-height: 1.1;
    }

    .lead {
      max-width: 640px;
      margin: 14px 0 24px;
      color: var(--sb-text-muted);
      font-size: 16px;
      line-height: 1.6;
    }

    .install {
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }

    .install-item {
      display: flex;
      align-items: center;
      gap: 12px;
      padding: 6px 6px 6px 14px;
      border: 1px solid var(--sb-border);
      border-radius: 12px;
      background: var(--sb-surface);
      box-shadow: var(--sb-shadow);
    }

    .install-item code {
      font: 13px var(--sb-mono);
    }

    .install-item code::before {
      content: '$ ';
      color: var(--sb-text-subtle);
    }

    .toolbar {
      position: sticky;
      top: 0;
      z-index: 2;
      border-block: 1px solid var(--sb-border);
      background: color-mix(in srgb, var(--sb-bg) 85%, transparent);
      backdrop-filter: blur(12px);
    }

    .toolbar-inner {
      display: flex;
      flex-wrap: wrap;
      align-items: center;
      gap: 12px;
      padding-block: 12px;
    }

    .search {
      position: relative;
      display: flex;
      align-items: center;
      flex: 1 1 320px;
      --msr-icon-size: 20px;
    }

    .search .search-icon {
      position: absolute;
      left: 12px;
      color: var(--sb-text-subtle);
      pointer-events: none;
    }

    .search input {
      width: 100%;
      height: 40px;
      padding: 0 40px 0 40px;
      border: 1px solid var(--sb-border);
      border-radius: 10px;
      background: var(--sb-surface);
      color: var(--sb-text);
      font: 14px var(--sb-font);
      transition:
        border-color 120ms,
        box-shadow 120ms;
    }

    .search input::placeholder {
      color: var(--sb-text-subtle);
    }

    .search input:focus {
      outline: none;
      border-color: var(--sb-accent);
      box-shadow: 0 0 0 3px var(--sb-accent-soft);
    }

    .search kbd,
    .search .clear {
      position: absolute;
      right: 10px;
    }

    kbd {
      padding: 2px 7px;
      border: 1px solid var(--sb-border);
      border-radius: 6px;
      color: var(--sb-text-subtle);
      font: 12px var(--sb-mono);
    }

    .clear {
      display: grid;
      place-items: center;
      padding: 4px;
      border: 0;
      border-radius: 6px;
      background: transparent;
      color: var(--sb-text-muted);
      cursor: pointer;
      --msr-icon-size: 18px;
    }

    .clear:hover {
      background: var(--sb-surface-muted);
    }

    .segmented {
      display: inline-flex;
      padding: 3px;
      border: 1px solid var(--sb-border);
      border-radius: 10px;
      background: var(--sb-surface-muted);
    }

    .segmented button {
      height: 32px;
      padding: 0 12px;
      border: 0;
      border-radius: 7px;
      background: transparent;
      color: var(--sb-text-muted);
      font: 500 13px var(--sb-font);
      cursor: pointer;
    }

    .segmented button[aria-pressed='true'] {
      background: var(--sb-surface);
      color: var(--sb-text);
      box-shadow: 0 1px 2px rgb(0 0 0 / 0.12);
    }

    .segmented button:focus-visible,
    .clear:focus-visible,
    .tile:focus-visible,
    .more:focus-visible {
      outline: 2px solid var(--sb-accent);
      outline-offset: 2px;
    }

    .count {
      margin-left: auto;
      color: var(--sb-text-muted);
      font-size: 13px;
      white-space: nowrap;
    }

    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fill, minmax(var(--tile-min), 1fr));
      gap: 12px;
      padding-block: 24px;
    }

    .tile {
      display: grid;
      grid-template-rows: 1fr auto;
      gap: 10px;
      min-height: calc(var(--icon-size) * 1px + 64px);
      padding: 18px 10px 12px;
      border: 1px solid var(--sb-border);
      border-radius: 14px;
      background: var(--sb-surface);
      color: var(--sb-text);
      text-decoration: none;
      transition:
        border-color 120ms,
        box-shadow 120ms,
        transform 120ms;
    }

    .tile:hover {
      border-color: var(--sb-accent);
      box-shadow: var(--sb-shadow-lg);
      transform: translateY(-1px);
    }

    .tile:hover .icons {
      color: var(--sb-accent);
    }

    .icons {
      display: flex;
      justify-content: center;
      align-items: center;
      gap: 14px;
      font-size: calc(var(--icon-size) * 1px);
    }

    .placeholder {
      width: calc(var(--icon-size) * 1px);
      height: calc(var(--icon-size) * 1px);
      border-radius: 8px;
      background: var(--sb-surface-muted);
    }

    .name {
      overflow: hidden;
      color: var(--sb-text-muted);
      font: 12px var(--sb-mono);
      text-align: center;
      text-overflow: ellipsis;
      white-space: nowrap;
    }

    .tile:hover .name {
      color: var(--sb-text);
    }

    .more {
      display: block;
      margin: 0 auto 48px;
      padding: 10px 18px;
      border: 1px solid var(--sb-border);
      border-radius: 10px;
      background: var(--sb-surface);
      color: var(--sb-text);
      font: 500 14px var(--sb-font);
      cursor: pointer;
    }

    .empty {
      display: grid;
      justify-items: center;
      gap: 8px;
      padding: 80px 0;
      color: var(--sb-text-muted);
      text-align: center;
      --msr-icon-size: 40px;
    }

    .empty strong {
      color: var(--sb-text);
      font-size: 16px;
    }

    .visually-hidden {
      position: absolute;
      width: 1px;
      height: 1px;
      overflow: hidden;
      clip-path: inset(50%);
      white-space: nowrap;
    }
  `,
  template: `
    <header class="hero">
      <div class="container">
        <p class="eyebrow">Angular · Standalone components</p>
        <h1>Material Symbols</h1>
        <p class="lead">
          {{ names().length.toLocaleString('en-US') }} {{ styleDef().label }} icons, each its own
          standalone Angular component with an inline SVG. Import only what you use, in Rounded,
          Outlined or Sharp style, unfilled or filled.
        </p>
        <div class="install">
          @for (pkg of packages(); track pkg.name) {
            <div class="install-item">
              <code>npm i {{ pkg.name }}</code>
              <msr-sb-copy-button
                [text]="'npm i ' + pkg.name"
                [ariaLabel]="'Copy install command for ' + pkg.label"
              />
            </div>
          }
        </div>
      </div>
    </header>

    <main>
      <div class="toolbar">
        <div class="container toolbar-inner">
          <div class="search">
            <msr-search-icon class="search-icon" />
            <label for="icon-search" class="visually-hidden">Search icons</label>
            <input
              #search
              id="icon-search"
              type="search"
              autocomplete="off"
              spellcheck="false"
              placeholder="Search {{ names().length.toLocaleString('en-US') }} icons…"
              [value]="query()"
              (input)="setQuery($any($event.target).value)"
            />
            @if (query()) {
              <button type="button" class="clear" aria-label="Clear search" (click)="setQuery('')">
                <msr-close-icon />
              </button>
            } @else {
              <kbd aria-hidden="true">/</kbd>
            }
          </div>

          <div class="segmented" role="group" aria-label="Style">
            @for (option of styles; track option.value) {
              <button
                type="button"
                [attr.aria-pressed]="iconStyle() === option.value"
                (click)="setStyle(option.value)"
              >
                {{ option.label }}
              </button>
            }
          </div>

          <div class="segmented" role="group" aria-label="Fill">
            @for (mode of fillModes; track mode.value) {
              <button
                type="button"
                [attr.aria-pressed]="fill() === mode.value"
                (click)="fill.set(mode.value)"
              >
                {{ mode.label }}
              </button>
            }
          </div>

          <div class="segmented" role="group" aria-label="Icon size">
            @for (option of sizes; track option) {
              <button
                type="button"
                [attr.aria-pressed]="size() === option"
                (click)="size.set(option)"
              >
                {{ option }}px
              </button>
            }
          </div>

          <span class="count" aria-live="polite">
            {{ filtered().length.toLocaleString('en-US') }}
            {{ filtered().length === 1 ? 'icon' : 'icons' }}
          </span>
        </div>
      </div>

      <div class="container">
        @if (filtered().length === 0) {
          <div class="empty">
            <msr-search-icon />
            <strong>No icons match “{{ query() }}”</strong>
            <span>Try a broader term, such as “arrow” or “home”.</span>
          </div>
        } @else {
          <div
            class="grid"
            [style.--icon-size]="size()"
            [style.--tile-min.px]="fill() === 'both' ? 168 : 128"
          >
            @for (name of visible(); track name) {
              @let entry = groups()[groupOf(name)]?.[name];
              <a class="tile" [href]="href(name)" target="_top" [title]="name">
                <span class="icons">
                  @if (!entry) {
                    <span class="placeholder"></span>
                  } @else {
                    @if (fill() !== 'filled' && entry[styleDef().unfilled]; as unfilled) {
                      <ng-container *ngComponentOutlet="unfilled.component" />
                    }
                    @if (fill() !== 'unfilled' && entry[styleDef().filled]; as filled) {
                      <ng-container *ngComponentOutlet="filled.component" />
                    }
                  }
                </span>
                <span class="name">{{ name }}</span>
              </a>
            }
          </div>

          @if (visible().length < filtered().length) {
            <button type="button" class="more" (msrSbInView)="showMore()" (click)="showMore()">
              Show more icons
            </button>
          }
        }
      </div>
    </main>
  `,
})
class CatalogComponent {
  protected readonly styles = STYLES;
  protected readonly fillModes = FILL_MODES;
  protected readonly sizes = SIZES;

  protected readonly query = signal('');
  protected readonly iconStyle = signal<IconStyle>('rounded');
  protected readonly fill = signal<FillMode>('both');
  protected readonly size = signal<number>(32);
  private readonly limit = signal(PAGE_SIZE);
  @ViewChild('search', { static: true }) private searchInput?: ElementRef<HTMLInputElement>;

  protected readonly styleDef = computed(
    () => STYLES.find(({ value }) => value === this.iconStyle()) ?? STYLES[0],
  );
  protected readonly names = computed(() => NAMES_BY_STYLE[this.iconStyle()]);
  protected readonly packages = computed(() => [
    PACKAGES[this.styleDef().unfilled],
    PACKAGES[this.styleDef().filled],
  ]);

  protected readonly filtered = computed(() => {
    const terms = this.query().trim().toLowerCase().split(/\s+/).filter(Boolean);
    const names = this.names();
    if (terms.length === 0) return names;
    return names.filter((name) => terms.every((term) => name.includes(term.replaceAll('-', '_'))));
  });
  protected readonly visible = computed(() => this.filtered().slice(0, this.limit()));

  /** Icon groups are code-split; only the groups of the visible icons are fetched. */
  protected readonly groups = signal<Record<string, IconGroup>>({});
  private readonly requestedGroups = new Set<string>();

  protected readonly groupOf = iconGroupOf;

  constructor() {
    effect(() => {
      for (const group of new Set(this.visible().map(iconGroupOf))) {
        if (this.requestedGroups.has(group)) continue;
        this.requestedGroups.add(group);
        void ICON_GROUP_LOADERS[group]?.().then((icons) =>
          this.groups.update((loaded) => ({ ...loaded, [group]: icons })),
        );
      }
    });
  }

  protected href(name: string): string {
    return `${storyHref(iconStoryId(name))}&args=style:${this.iconStyle()}`;
  }

  protected setStyle(style: IconStyle): void {
    this.iconStyle.set(style);
    this.limit.set(PAGE_SIZE);
  }

  protected setQuery(query: string): void {
    this.query.set(query);
    this.limit.set(PAGE_SIZE);
  }

  protected showMore(): void {
    this.limit.update((limit) => limit + PAGE_SIZE);
  }

  protected onKeydown(event: KeyboardEvent): void {
    const target = event.target as HTMLElement | null;
    const typing = target?.closest('input, textarea, select, [contenteditable="true"]');
    if (event.key === '/' && !typing) {
      event.preventDefault();
      this.searchInput?.nativeElement.focus();
    }
  }
}

const meta: Meta<CatalogComponent> = {
  title: 'Catalog',
  component: CatalogComponent,
  parameters: {
    layout: 'fullscreen',
    controls: { disable: true },
    actions: { disable: true },
  },
};

export default meta;
type Story = StoryObj<CatalogComponent>;

export const AllIcons: Story = { name: 'All icons' };
