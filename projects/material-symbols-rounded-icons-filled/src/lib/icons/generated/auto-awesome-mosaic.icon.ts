import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-auto-awesome-mosaic-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M440-120H200q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h240v720Zm80-400v-320h240q33 0 56.5 23.5T840-760v240H520Zm0 400v-320h320v240q0 33-23.5 56.5T760-120H520Z"/></svg>`,
})
export class MsrfAutoAwesomeMosaicIconComponent {}
