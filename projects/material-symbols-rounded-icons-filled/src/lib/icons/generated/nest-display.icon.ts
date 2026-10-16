import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-nest-display-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M480-200q-99 0-169.5-13.5T240-246v-34h-73q-35 0-59-26t-21-61l27-320q2-31 25-52t55-21h572q32 0 55 21t25 52l27 320q3 35-21 61t-59 26h-73v34q0 19-70.5 32.5T480-200Z"/></svg>`,
})
export class MsrfNestDisplayIconComponent {}
