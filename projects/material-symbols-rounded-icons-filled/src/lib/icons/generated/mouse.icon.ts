import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-mouse-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M480-80q-117 0-198.5-81.5T200-360v-160h560v160q0 117-81.5 198.5T480-80ZM200-600q0-105 68-183.5T440-877v277H200Zm320 0v-277q104 15 172 93.5T760-600H520Z"/></svg>`,
})
export class MsrfMouseIconComponent {}
