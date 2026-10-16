import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-line-end-square-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M480-260q-17 0-28.5-11.5T440-300v-140H120q-17 0-28.5-11.5T80-480q0-17 11.5-28.5T120-520h320v-140q0-17 11.5-28.5T480-700h360q17 0 28.5 11.5T880-660v360q0 17-11.5 28.5T840-260H480Z"/></svg>`,
})
export class MsrfLineEndSquareIconComponent {}
