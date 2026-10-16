import { Directive, inject } from '@angular/core';
import { MsrIconHostDirective } from './msr-icon-host.directive';

@Directive({
  selector: 'svg[msrIconSvg]',
  host: {
    class: 'msr-icon-svg',
    '[attr.aria-hidden]': "ariaLabel() ? null : 'true'",
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.role]': "ariaLabel() ? 'img' : null",
  },
})
export class MsrIconSvgDirective {
  protected readonly ariaLabel = inject(MsrIconHostDirective).ariaLabel;
}
