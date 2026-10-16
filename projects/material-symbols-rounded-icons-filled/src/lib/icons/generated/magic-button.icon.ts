import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-magic-button-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 0 24 24"><path d="m10 19-2.5-5.5L2 11l5.5-2.5L10 3l2.5 5.5L18 11l-5.5 2.5Zm8 2-1.25-2.75L14 17l2.75-1.25L18 13l1.25 2.75L22 17l-2.75 1.25Z"/></svg>`,
})
export class MsrfMagicButtonIconComponent {}
