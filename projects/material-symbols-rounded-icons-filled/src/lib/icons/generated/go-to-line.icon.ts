import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-go-to-line-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M480-680q-25 0-42.5-17.5T420-740q0-25 17.5-42.5T480-800q25 0 42.5 17.5T540-740q0 25-17.5 42.5T480-680Zm0 520q-25 0-42.5-17.5T420-220q0-25 17.5-42.5T480-280q25 0 42.5 17.5T540-220q0 25-17.5 42.5T480-160Z"/></svg>`,
})
export class MsrfGoToLineIconComponent {}
