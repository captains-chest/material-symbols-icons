import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-view-column-2-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M600-120q-33 0-56.5-23.5T520-200v-560q0-33 23.5-56.5T600-840h160q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H600Zm-400 0q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h160q33 0 56.5 23.5T440-760v560q0 33-23.5 56.5T360-120H200Z"/></svg>`,
})
export class MsrfViewColumn2IconComponent {}
