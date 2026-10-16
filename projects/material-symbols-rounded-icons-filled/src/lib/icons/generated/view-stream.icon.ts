import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-view-stream-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M200-200q-33 0-56.5-23.5T120-280v-80q0-33 23.5-56.5T200-440h560q33 0 56.5 23.5T840-360v80q0 33-23.5 56.5T760-200H200Zm0-320q-33 0-56.5-23.5T120-600v-80q0-33 23.5-56.5T200-760h560q33 0 56.5 23.5T840-680v80q0 33-23.5 56.5T760-520H200Z"/></svg>`,
})
export class MsrfViewStreamIconComponent {}
