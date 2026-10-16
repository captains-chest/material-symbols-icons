import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-outdoor-garden-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M80-120h240v-600L200-840 80-720v600Zm280 0h240v-600L480-840 360-720v600Zm280 0h240v-600L760-840 640-720v600Z"/></svg>`,
})
export class MsrfOutdoorGardenIconComponent {}
