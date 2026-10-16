import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-line-end-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M780-380q-31 0-56-17t-36-43H120q-17 0-28.5-11.5T80-480q0-17 11.5-28.5T120-520h568q11-26 36-43t56-17q42 0 71 29t29 71q0 42-29 71t-71 29Z"/></svg>`,
})
export class MsrLineEndIconComponent {}
