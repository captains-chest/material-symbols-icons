import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-south-east-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M624-280 188-716q-11-11-11-28t11-28q11-11 28-11t28 11l436 436v-224q0-17 11.5-28.5T720-600q17 0 28.5 11.5T760-560v320q0 17-11.5 28.5T720-200H400q-17 0-28.5-11.5T360-240q0-17 11.5-28.5T400-280h224Z"/></svg>`,
})
export class MsrfSouthEastIconComponent {}
