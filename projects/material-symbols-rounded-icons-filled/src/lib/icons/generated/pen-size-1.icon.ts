import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-pen-size-1-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M199-199q-9-9-9-21t9-21l520-520q9-9 21-9t21 9q9 9 9 21t-9 21L241-199q-9 9-21 9t-21-9Z"/></svg>`,
})
export class MsrfPenSize1IconComponent {}
