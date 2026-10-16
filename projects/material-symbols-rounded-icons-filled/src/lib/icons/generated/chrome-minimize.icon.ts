import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-chrome-minimize-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 96 960 960"><path d="M200 896q-17 0-28.5-11.5T160 856q0-17 11.5-28.5T200 816h560q17 0 28.5 11.5T800 856q0 17-11.5 28.5T760 896H200Z"/></svg>`,
})
export class MsrfChromeMinimizeIconComponent {}
