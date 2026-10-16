import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-highlighter-size-3-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M310-170 169-311q-11-11-11-28t11-28l423-424q12-12 29-12t28 12l141 142q11 11 11 28t-11 28L367-170q-12 12-28.5 12T310-170Z"/></svg>`,
})
export class MsrfHighlighterSize3IconComponent {}
