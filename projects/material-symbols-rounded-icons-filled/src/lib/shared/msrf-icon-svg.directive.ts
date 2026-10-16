import { Directive, inject } from '@angular/core';
import { MsrfIconHostDirective } from './msrf-icon-host.directive';

@Directive({
  selector: 'svg[msrfIconSvg]',
  host: {
    class: 'msrf-icon-svg',
    '[attr.aria-hidden]': "ariaLabel() ? null : 'true'",
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.role]': "ariaLabel() ? 'img' : null",
  },
})
export class MsrfIconSvgDirective {
  protected readonly ariaLabel = inject(MsrfIconHostDirective).ariaLabel;
}
