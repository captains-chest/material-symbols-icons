import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-h-mobiledata-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M360-440v120q0 17-11.5 28.5T320-280q-17 0-28.5-11.5T280-320v-320q0-17 11.5-28.5T320-680q17 0 28.5 11.5T360-640v120h240v-120q0-17 11.5-28.5T640-680q17 0 28.5 11.5T680-640v320q0 17-11.5 28.5T640-280q-17 0-28.5-11.5T600-320v-120H360Z"/></svg>`,
})
export class MsrfHMobiledataIconComponent {}
