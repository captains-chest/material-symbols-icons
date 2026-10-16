import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-privacy-screen-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 96 960 960"><path d="m80 560 304-304H160q-33 0-56.5 23.5T80 336v224Zm0 280 583-584H496L80 673v167Zm56 56h664q33 0 56.5-23.5T880 816V336q0-33-23.5-56.5T800 256h-24L136 896Z"/></svg>`,
})
export class MsrfPrivacyScreenIconComponent {}
