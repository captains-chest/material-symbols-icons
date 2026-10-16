import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-overview-key-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M120-200q-33 0-56.5-23.5T40-280v-400q0-33 23.5-56.5T120-760h400q33 0 56.5 23.5T600-680v400q0 33-23.5 56.5T520-200H120Zm0-80h400v-400H120v400Zm600 80q-17 0-28.5-11.5T680-240v-480q0-17 11.5-28.5T720-760q17 0 28.5 11.5T760-720v480q0 17-11.5 28.5T720-200Zm160 0q-17 0-28.5-11.5T840-240v-480q0-17 11.5-28.5T880-760q17 0 28.5 11.5T920-720v480q0 17-11.5 28.5T880-200Zm-760-80v-400 400Z"/></svg>`,
})
export class MsrOverviewKeyIconComponent {}
