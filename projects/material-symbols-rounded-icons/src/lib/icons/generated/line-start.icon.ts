import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-line-start-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M180-380q-42 0-71-29t-29-71q0-42 29-71t71-29q31 0 56 17t36 43h568q17 0 28.5 11.5T880-480q0 17-11.5 28.5T840-440H272q-11 26-36 43t-56 17Z"/></svg>`,
})
export class MsrLineStartIconComponent {}
