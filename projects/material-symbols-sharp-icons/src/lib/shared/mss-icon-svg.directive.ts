import { Directive, inject } from '@angular/core';
import { MssIconHostDirective } from './mss-icon-host.directive';

@Directive({
  selector: 'svg[mssIconSvg]',
  host: {
    class: 'mss-icon-svg',
    '[attr.aria-hidden]': "ariaLabel() ? null : 'true'",
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.role]': "ariaLabel() ? 'img' : null",
  },
})
export class MssIconSvgDirective {
  protected readonly ariaLabel = inject(MssIconHostDirective).ariaLabel;
}
