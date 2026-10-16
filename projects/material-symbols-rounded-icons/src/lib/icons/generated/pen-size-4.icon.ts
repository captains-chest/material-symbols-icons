import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-pen-size-4-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M229-229q-29-29-29-71t29-71l360-360q29-29 71-29t71 29q29 29 29 71t-29 71L371-229q-29 29-71 29t-71-29Z"/></svg>`,
})
export class MsrPenSize4IconComponent {}
