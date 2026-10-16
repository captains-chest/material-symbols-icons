import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-keyboard-option-key-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M637-200q-22 0-40-10.5T568-240L314-680H160q-17 0-28.5-11.5T120-720q0-17 11.5-28.5T160-760h154q22 0 40 10.5t29 29.5l254 440h163q17 0 28.5 11.5T840-240q0 17-11.5 28.5T800-200H637Zm3-480q-17 0-28.5-11.5T600-720q0-17 11.5-28.5T640-760h160q17 0 28.5 11.5T840-720q0 17-11.5 28.5T800-680H640Z"/></svg>`,
})
export class MsrfKeyboardOptionKeyIconComponent {}
