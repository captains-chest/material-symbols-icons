import { NgComponentOutlet } from '@angular/common';
import { Component, Input } from '@angular/core';
import { moduleMetadata, type Meta } from '@storybook/angular';
import { MsrArrowBackIconComponent } from '../projects/material-symbols-rounded-icons/src/lib/icons/generated/arrow-back.icon';
import { CopyButtonComponent } from './copy-button';
import {
  CATALOG_STORY_ID,
  iconGroupOf,
  kebabName,
  PACKAGES,
  storyHref,
  STYLES,
  type IconEntry,
  type IconGroup,
  type IconStyle,
  type IconVariant,
} from './icon-types';

export interface IconDetailArgs {
  name: string;
  style: IconStyle;
  size: number;
  color: string;
}

const SIZE_SCALE = [16, 20, 24, 32, 40, 48];

@Component({
  selector: 'msr-sb-icon-detail',
  imports: [NgComponentOutlet, CopyButtonComponent, MsrArrowBackIconComponent],
  styles: `
    :host {
      display: block;
      min-height: 100vh;
      padding: 32px clamp(16px, 4vw, 48px) 56px;
      box-sizing: border-box;
      background: var(--sb-bg);
      color: var(--sb-text);
      font-family: var(--sb-font);
    }

    .page {
      max-width: 1080px;
      margin: 0 auto;
      display: grid;
      gap: 28px;
    }

    .back {
      display: inline-flex;
      align-items: center;
      gap: 6px;
      width: fit-content;
      color: var(--sb-text-muted);
      font-size: 13px;
      font-weight: 500;
      text-decoration: none;
      --msr-icon-size: 18px;
    }

    .back:hover {
      color: var(--sb-accent);
    }

    .heading {
      display: grid;
      gap: 10px;
    }

    h1 {
      margin: 0;
      font-size: clamp(28px, 4vw, 40px);
      font-weight: 650;
      letter-spacing: -0.02em;
      word-break: break-word;
    }

    .chips {
      display: flex;
      flex-wrap: wrap;
      gap: 8px;
    }

    .chip {
      padding: 4px 10px;
      border-radius: 999px;
      background: var(--sb-surface-muted);
      color: var(--sb-text-muted);
      font: 500 12px/1.4 var(--sb-mono);
    }

    .previews {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
      gap: 20px;
    }

    .card {
      display: grid;
      grid-template-rows: auto 1fr auto;
      border: 1px solid var(--sb-border);
      border-radius: 16px;
      background: var(--sb-surface);
      overflow: hidden;
      box-shadow: var(--sb-shadow);
    }

    .card-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 14px 18px;
      border-bottom: 1px solid var(--sb-border);
      font-size: 13px;
      font-weight: 600;
    }

    .card-header code {
      color: var(--sb-text-muted);
      font: 12px var(--sb-mono);
    }

    .stage {
      display: grid;
      place-items: center;
      min-height: 260px;
      padding: 24px;
      background-color: var(--sb-surface-muted);
      background-image: radial-gradient(var(--sb-dot) 1px, transparent 1px);
      background-size: 16px 16px;
      color: var(--icon-color, var(--sb-text));
      font-size: var(--icon-size);
    }

    .scale {
      display: flex;
      justify-content: space-around;
      align-items: end;
      gap: 12px;
      padding: 16px 18px;
      border-top: 1px solid var(--sb-border);
    }

    .scale figure {
      display: grid;
      justify-items: center;
      gap: 8px;
      margin: 0;
    }

    .scale figcaption {
      color: var(--sb-text-subtle);
      font: 11px var(--sb-mono);
    }

    .missing {
      color: var(--sb-text-subtle);
      font-size: 14px;
    }

    h2 {
      margin: 0 0 12px;
      font-size: 18px;
      font-weight: 600;
    }

    .usage {
      display: grid;
      gap: 16px;
    }

    .snippet {
      border: 1px solid var(--sb-border);
      border-radius: 12px;
      background: var(--sb-code-bg);
      overflow: hidden;
    }

    .snippet-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      gap: 12px;
      padding: 8px 8px 8px 16px;
      border-bottom: 1px solid var(--sb-code-border);
      color: var(--sb-code-muted);
      font-size: 12px;
      font-weight: 600;
    }

    pre {
      margin: 0;
      padding: 16px;
      overflow-x: auto;
      color: var(--sb-code-text);
      font: 13px/1.7 var(--sb-mono);
    }
  `,
  template: `
    <main class="page">
      <a class="back" [href]="catalogHref" target="_top">
        <msr-arrow-back-icon />
        All icons
      </a>

      <header class="heading">
        <h1>{{ name }}</h1>
        <div class="chips">
          @for (variant of variants; track variant) {
            @if (icon[variant]) {
              <span class="chip">&lt;{{ selector(variant) }}&gt;</span>
            }
          }
          <span class="chip">group {{ group }}</span>
        </div>
      </header>

      <section class="previews" aria-label="Previews">
        @for (variant of variants; track variant) {
          <article class="card">
            <div class="card-header">
              <span>{{ packages[variant].label }}</span>
              <code>{{ size }}px</code>
            </div>
            <div class="stage" [style.--icon-size.px]="size" [style.--icon-color]="color || null">
              @if (icon[variant]; as entry) {
                <ng-container *ngComponentOutlet="entry.component" />
              } @else {
                <span class="missing">Not available in {{ packages[variant].name }}</span>
              }
            </div>
            @if (icon[variant]; as entry) {
              <div class="scale">
                @for (step of sizeScale; track step) {
                  <figure [style.font-size.px]="step">
                    <ng-container *ngComponentOutlet="entry.component" />
                    <figcaption>{{ step }}</figcaption>
                  </figure>
                }
              </div>
            }
          </article>
        }
      </section>

      <section class="usage">
        <h2>Usage</h2>
        @for (variant of variants; track variant) {
          @if (icon[variant]; as entry) {
            <div class="snippet">
              <div class="snippet-header">
                <span>{{ packages[variant].label }} · {{ packages[variant].name }}</span>
                <msr-sb-copy-button
                  [text]="snippet(variant)"
                  [ariaLabel]="'Copy ' + packages[variant].name + ' usage'"
                />
              </div>
              <pre><code>{{ snippet(variant) }}</code></pre>
            </div>
          }
        }
      </section>
    </main>
  `,
})
export class IconDetailComponent {
  // Decorator inputs: Storybook compiles stories in JIT mode, where signal inputs are not registered.
  @Input() name = '';
  @Input() icon: IconEntry = {};
  @Input() iconStyle: IconStyle = 'rounded';
  @Input() size = 96;
  @Input() color = '';

  protected get variants(): IconVariant[] {
    const style = STYLES.find(({ value }) => value === this.iconStyle) ?? STYLES[0];
    return [style.unfilled, style.filled];
  }
  protected readonly packages = PACKAGES;
  protected readonly sizeScale = SIZE_SCALE;
  protected readonly catalogHref = storyHref(CATALOG_STORY_ID);
  protected get group(): string {
    return iconGroupOf(this.name).toUpperCase();
  }

  protected selector(variant: IconVariant): string {
    return `${PACKAGES[variant].prefix}-${kebabName(this.name)}-icon`;
  }

  protected snippet(variant: IconVariant): string {
    const entry = this.icon[variant];
    if (!entry) return '';
    const subpath = `${PACKAGES[variant].name}/${kebabName(this.name)}`;
    return (
      `import { ${entry.className} } from '${subpath}';\n\n` +
      `@Component({\n  imports: [${entry.className}],\n  template: \`<${this.selector(variant)} />\`,\n})`
    );
  }
}

/** Shared meta for the generated `Icons/<group>` story files. */
export function iconDetailMeta(icons: IconGroup): Omit<Meta<IconDetailArgs>, 'title'> {
  return {
    decorators: [moduleMetadata({ imports: [IconDetailComponent] })],
    parameters: { layout: 'fullscreen' },
    args: { style: 'rounded', size: 96, color: '' },
    argTypes: {
      name: { table: { disable: true } },
      style: {
        control: {
          type: 'inline-radio',
          labels: Object.fromEntries(STYLES.map((s) => [s.value, s.label])),
        },
        options: STYLES.map(({ value }) => value),
        description: 'Symbol style',
      },
      size: {
        control: { type: 'range', min: 12, max: 192, step: 4 },
        description: 'Preview size (px)',
      },
      color: { control: 'color', description: 'Preview color (icons inherit `currentColor`)' },
    },
    render: (args) => ({
      props: { ...args, icon: icons[args.name] ?? {} },
      template: `<msr-sb-icon-detail [name]="name" [icon]="icon" [iconStyle]="style" [size]="size" [color]="color" />`,
    }),
  };
}
