import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-minimize-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M280-120q-17 0-28.5-11.5T240-160q0-17 11.5-28.5T280-200h400q17 0 28.5 11.5T720-160q0 17-11.5 28.5T680-120H280Z"/></svg>`,
})
export class MsrfMinimizeIconComponent {}
