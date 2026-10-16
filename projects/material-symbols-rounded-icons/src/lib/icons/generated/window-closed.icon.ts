import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-window-closed-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M240-200h480v-240H240v240Zm0 80q-33 0-56.5-23.5T160-200v-560q0-33 23.5-56.5T240-840h480q33 0 56.5 23.5T800-760v560q0 33-23.5 56.5T720-120H240Zm0-400h200v-20q0-8 6-14t14-6h40q8 0 14 6t6 14v20h200v-240H240v240Zm0 320h480-480Z"/></svg>`,
})
export class MsrWindowClosedIconComponent {}
