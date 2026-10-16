import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-hdr-weak-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M200-320q-66 0-113-47T40-480q0-66 47-113t113-47q66 0 113 47t47 113q0 66-47 113t-113 47Zm480 80q-100 0-170-70t-70-170q0-100 70-170t170-70q100 0 170 70t70 170q0 100-70 170t-170 70Zm0-80q66 0 113-47t47-113q0-66-47-113t-113-47q-66 0-113 47t-47 113q0 66 47 113t113 47Z"/></svg>`,
})
export class MsrHdrWeakIconComponent {}
