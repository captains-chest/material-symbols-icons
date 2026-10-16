import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-trending-down-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M744-320 536-526 433-423q-23 23-57 23t-57-23L108-636q-11-11-11.5-27.5T108-692q11-11 28-11t28 11l212 212 103-103q23-23 57-23t57 23l207 207v-64q0-17 11.5-28.5T840-480q17 0 28.5 11.5T880-440v160q0 17-11.5 28.5T840-240H680q-17 0-28.5-11.5T640-280q0-17 11.5-28.5T680-320h64Z"/></svg>`,
})
export class MsrTrendingDownIconComponent {}
