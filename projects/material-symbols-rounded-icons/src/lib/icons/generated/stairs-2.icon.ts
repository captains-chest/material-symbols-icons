import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-stairs-2-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M120-200q-17 0-28.5-11.5T80-240q0-17 11.5-28.5T120-280h200v-200q0-17 11.5-28.5T360-520h200v-200q0-17 11.5-28.5T600-760h240q17 0 28.5 11.5T880-720q0 17-11.5 28.5T840-680H640v200q0 17-11.5 28.5T600-440H400v200q0 17-11.5 28.5T360-200H120Z"/></svg>`,
})
export class MsrStairs2IconComponent {}
