import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-brick-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M80-220v-360q0-25 17.5-42.5T140-640h60v-100q0-25 17.5-42.5T260-800h120q25 0 42.5 17.5T440-740v100h80v-100q0-25 17.5-42.5T580-800h120q25 0 42.5 17.5T760-740v100h60q25 0 42.5 17.5T880-580v360q0 25-17.5 42.5T820-160H140q-25 0-42.5-17.5T80-220Z"/></svg>`,
})
export class MsrfBrickIconComponent {}
