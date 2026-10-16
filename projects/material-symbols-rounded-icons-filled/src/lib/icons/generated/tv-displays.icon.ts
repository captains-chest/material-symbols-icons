import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-tv-displays-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M120-320q-17 0-28.5-11.5T80-360v-440q0-33 23.5-56.5T160-880h520q17 0 28.5 11.5T720-840q0 17-11.5 28.5T680-800H160v440q0 17-11.5 28.5T120-320ZM480-80q-17 0-28.5-11.5T440-120v-40H320q-33 0-56.5-23.5T240-240v-400q0-33 23.5-56.5T320-720h520q33 0 56.5 23.5T920-640v400q0 33-23.5 56.5T840-160H720v40q0 17-11.5 28.5T680-80H480Z"/></svg>`,
})
export class MsrfTvDisplaysIconComponent {}
