import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-background-grid-small-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M200-200h80v-80h-80v80Zm160 0h80v-80h-80v80Zm160 0h80v-80h-80v80Zm160 0h80v-80h-80v80ZM200-680h80v-80h-80v80Zm0 160h80v-80h-80v80Zm0 160h80v-80h-80v80Zm160-320h80v-80h-80v80Zm0 160h80v-80h-80v80Zm0 160h80v-80h-80v80Zm160-320h80v-80h-80v80Zm0 160h80v-80h-80v80Zm0 160h80v-80h-80v80Zm160-320h80v-80h-80v80Zm0 160h80v-80h-80v80Zm0 160h80v-80h-80v80ZM200-120q-33 0-56.5-23.5T120-200v-560q0-33 23.5-56.5T200-840h560q33 0 56.5 23.5T840-760v560q0 33-23.5 56.5T760-120H200Z"/></svg>`,
})
export class MsrBackgroundGridSmallIconComponent {}
