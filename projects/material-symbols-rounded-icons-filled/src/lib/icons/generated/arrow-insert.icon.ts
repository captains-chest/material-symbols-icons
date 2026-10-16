import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-arrow-insert-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M320-624v304q0 17-11.5 28.5T280-280q-17 0-28.5-11.5T240-320v-400q0-17 11.5-28.5T280-760h400q17 0 28.5 11.5T720-720q0 17-11.5 28.5T680-680H376l356 356q11 11 11 28t-11 28q-11 11-28 11t-28-11L320-624Z"/></svg>`,
})
export class MsrfArrowInsertIconComponent {}
