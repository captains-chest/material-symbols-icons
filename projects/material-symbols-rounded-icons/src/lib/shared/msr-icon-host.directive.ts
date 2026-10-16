import { CSP_NONCE, Directive, inject } from '@angular/core';
import { DOCUMENT } from '@angular/common';

/**
 * Shared base styles for every msr-* icon component.
 *
 * Injected once per document (browser page or SSR request) by the host directive, instead of being
 * repeated as component styles in all icon components. Selectors repeat the class to keep the same
 * specificity the old emulated-encapsulation styles had, so consumer overrides behave the same.
 */
export const MSR_ICON_STYLES = `.msr-icon.msr-icon{display:inline-flex;flex:0 0 auto}` +
  `.msr-icon{inline-size:var(--msr-icon-size, 1em);block-size:var(--msr-icon-size, 1em)}` +
  `.msr-icon-svg.msr-icon-svg{display:block;inline-size:100%;block-size:100%;fill:currentColor}`;

const STYLE_ELEMENT_ID = 'msr-icon-styles';
const styledDocuments = new WeakSet<Document>();

function ensureIconStyles(doc: Document, nonce: string | null): void {
  if (styledDocuments.has(doc)) return;
  styledDocuments.add(doc);
  if (doc.getElementById(STYLE_ELEMENT_ID)) return;
  const style = doc.createElement('style');
  style.id = STYLE_ELEMENT_ID;
  if (nonce) style.setAttribute('nonce', nonce);
  style.textContent = MSR_ICON_STYLES;
  doc.head.appendChild(style);
}

@Directive({
  selector: '[msrIconHost]',
  host: {
    class: 'msr-icon',
  },
})
export class MsrIconHostDirective {
  constructor() {
    ensureIconStyles(inject(DOCUMENT), inject(CSP_NONCE, { optional: true }));
  }
}
