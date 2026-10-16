import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-badge-critical-battery-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M200-280q-17 0-28.5-11.5T160-320v-80h-40q-17 0-28.5-11.5T80-440v-80q0-17 11.5-28.5T120-560h40v-80q0-17 11.5-28.5T200-680h640q17 0 28.5 11.5T880-640v320q0 17-11.5 28.5T840-280H200Zm40-80h520v-240H240v240Z"/></svg>`,
})
export class MsrfBadgeCriticalBatteryIconComponent {}
