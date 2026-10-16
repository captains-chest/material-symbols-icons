import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-tools-ladder-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M238-120q-19 0-30-15.5t-6-33.5l178-643q4-13 14-20.5t23-7.5q20 0 31 15.5t6 33.5l-20 71h225l25-92q4-13 14.5-20.5T722-840q19 0 30 15.5t6 33.5L580-148q-4 13-14 20.5t-23 7.5q-20 0-31-15.5t-6-33.5l20-71H301l-25 92q-4 13-14.5 20.5T238-120Zm141-400h224l33-120H412l-33 120Zm-55 200h224l33-120H357l-33 120Z"/></svg>`,
})
export class MsrfToolsLadderIconComponent {}
