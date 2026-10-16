import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-keyboard-control-key-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M480-647 284-452q-11 11-27.5 11.5T228-452q-11-11-11-28t11-28l224-224q12-12 28-12t28 12l224 224q11 11 11.5 27.5T732-452q-11 11-28 11t-28-11L480-647Z"/></svg>`,
})
export class MsrfKeyboardControlKeyIconComponent {}
