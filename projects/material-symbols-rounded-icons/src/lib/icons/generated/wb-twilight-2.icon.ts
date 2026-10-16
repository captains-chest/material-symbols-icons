import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-wb-twilight-2-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M120-160q-17 0-28.5-11.5T80-200q0-17 11.5-28.5T120-240h720q17 0 28.5 11.5T880-200q0 17-11.5 28.5T840-160H120Zm177-240h366q-23-54-72-87t-111-33q-62 0-111 33t-72 87Zm-97 80q0-117 81.5-198.5T480-600q117 0 198.5 81.5T760-320H200Zm280-80Z"/></svg>`,
})
export class MsrWbTwilight2IconComponent {}
