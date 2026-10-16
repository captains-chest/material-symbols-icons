import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-line-start-circle-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M320-240q-100 0-170-70T80-480q0-100 70-170t170-70q90 0 156.5 57T557-520h283q17 0 28.5 11.5T880-480q0 17-11.5 28.5T840-440H557q-14 86-80.5 143T320-240Z"/></svg>`,
})
export class MsrfLineStartCircleIconComponent {}
