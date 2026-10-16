import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-pen-size-2-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M212-212q-11-11-11-28t11-28l480-480q11-12 27.5-12t28.5 12q11 11 11 28t-11 28L268-212q-11 11-28 11t-28-11Z"/></svg>`,
})
export class MsrfPenSize2IconComponent {}
