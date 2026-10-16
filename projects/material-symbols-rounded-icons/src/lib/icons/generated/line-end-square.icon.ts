import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-line-end-square-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M520-340h280v-280H520v280Zm-40 80q-17 0-28.5-11.5T440-300v-140H120q-17 0-28.5-11.5T80-480q0-17 11.5-28.5T120-520h320v-140q0-17 11.5-28.5T480-700h360q17 0 28.5 11.5T880-660v360q0 17-11.5 28.5T840-260H480Zm180-220Z"/></svg>`,
})
export class MsrLineEndSquareIconComponent {}
