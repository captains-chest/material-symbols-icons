import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-window-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M520-440h320v240q0 33-23.5 56.5T760-120H520v-320Zm0-80v-320h240q33 0 56.5 23.5T840-760v240H520Zm-80 0H120v-240q0-33 23.5-56.5T200-840h240v320Zm0 80v320H200q-33 0-56.5-23.5T120-200v-240h320Z"/></svg>`,
})
export class MsrfWindowIconComponent {}
