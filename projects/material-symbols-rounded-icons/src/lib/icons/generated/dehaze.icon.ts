import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-dehaze-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M160-680q-17 0-28.5-11.5T120-720q0-17 11.5-28.5T160-760h640q17 0 28.5 11.5T840-720q0 17-11.5 28.5T800-680H160Zm0 480q-17 0-28.5-11.5T120-240q0-17 11.5-28.5T160-280h640q17 0 28.5 11.5T840-240q0 17-11.5 28.5T800-200H160Zm0-240q-17 0-28.5-11.5T120-480q0-17 11.5-28.5T160-520h640q17 0 28.5 11.5T840-480q0 17-11.5 28.5T800-440H160Z"/></svg>`,
})
export class MsrDehazeIconComponent {}
