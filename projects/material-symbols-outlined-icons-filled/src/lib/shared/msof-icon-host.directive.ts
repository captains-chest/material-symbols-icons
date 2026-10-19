import { CSP_NONCE, Directive, inject, input } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Shared base styles for every msof-* icon component.
 *
 * Injected once per document (browser page or SSR request) by the host directive, instead of being
 * repeated as component styles in all icon components. Selectors repeat the class to keep the same
 * specificity the old emulated-encapsulation styles had, so consumer overrides behave the same.
 */
export const MSOF_ICON_STYLES =
  `.msof-icon.msof-icon{display:inline-flex;flex:0 0 auto}` +
  `.msof-icon{inline-size:var(--msof-icon-size, 1em);block-size:var(--msof-icon-size, 1em)}` +
  `.msof-icon-svg.msof-icon-svg{display:block;inline-size:100%;block-size:100%;fill:currentColor}`;

const STYLE_ELEMENT_ID = 'msof-icon-styles';
const styledDocuments = new WeakSet<Document>();

function ensureIconStyles(doc: Document, nonce: string | null): void {
  if (styledDocuments.has(doc)) return;
  styledDocuments.add(doc);
  if (doc.getElementById(STYLE_ELEMENT_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  if (nonce) style.setAttribute('nonce', nonce);
  style.textContent = MSOF_ICON_STYLES;
  doc.head.appendChild(style);
}

@Directive({
  selector: '[msofIconHost]',
  host: {
    class: 'msof-icon',
  },
})
export class MsofIconHostDirective {
  /** Accessible label. When set, the icon gets role="img"; otherwise it is aria-hidden. */
  readonly ariaLabel = input<string | null>(null);

  constructor() {
    ensureIconStyles(inject(DOCUMENT), inject(CSP_NONCE, { optional: true }));
  }
}
