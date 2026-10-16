import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-eraser-size-3-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M340-200q-58 0-99-41t-41-99q0-27 10.5-53t30.5-46l280-280q20-20 46-30.5t53-10.5q58 0 99 41t41 99q0 27-10.5 53T719-521L439-241q-20 20-46 30.5T340-200Z"/></svg>`,
})
export class MsrfEraserSize3IconComponent {}
