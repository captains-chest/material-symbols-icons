import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-collapse-content-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M360-360H240q-17 0-28.5-11.5T200-400q0-17 11.5-28.5T240-440h160q17 0 28.5 11.5T440-400v160q0 17-11.5 28.5T400-200q-17 0-28.5-11.5T360-240v-120Zm240-240h120q17 0 28.5 11.5T760-560q0 17-11.5 28.5T720-520H560q-17 0-28.5-11.5T520-560v-160q0-17 11.5-28.5T560-760q17 0 28.5 11.5T600-720v120Z"/></svg>`,
})
export class MsrfCollapseContentIconComponent {}
