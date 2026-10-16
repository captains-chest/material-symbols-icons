import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-exclamation-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M480-400q-17 0-28.5-11.5T440-440v-280q0-17 11.5-28.5T480-760q17 0 28.5 11.5T520-720v280q0 17-11.5 28.5T480-400Zm0 200q-17 0-28.5-11.5T440-240q0-17 11.5-28.5T480-280q17 0 28.5 11.5T520-240q0 17-11.5 28.5T480-200Z"/></svg>`,
})
export class MsrExclamationIconComponent {}
