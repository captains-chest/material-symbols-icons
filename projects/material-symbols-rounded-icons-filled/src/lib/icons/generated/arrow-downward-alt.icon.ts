import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-arrow-downward-alt-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M440-392v-328q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v328l116-116q11-11 28-11t28 11q11 11 11 28t-11 28L508-268q-12 12-28 12t-28-12L268-452q-11-11-11-28t11-28q11-11 28-11t28 11l116 116Z"/></svg>`,
})
export class MsrfArrowDownwardAltIconComponent {}
