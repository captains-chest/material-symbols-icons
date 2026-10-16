import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-straighten-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M160-240q-33 0-56.5-23.5T80-320v-320q0-33 23.5-56.5T160-720h120v200q0 17 11.5 28.5T320-480q17 0 28.5-11.5T360-520v-200h80v200q0 17 11.5 28.5T480-480q17 0 28.5-11.5T520-520v-200h80v200q0 17 11.5 28.5T640-480q17 0 28.5-11.5T680-520v-200h120q33 0 56.5 23.5T880-640v320q0 33-23.5 56.5T800-240H160Z"/></svg>`,
})
export class MsrfStraightenIconComponent {}
