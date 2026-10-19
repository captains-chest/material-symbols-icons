import { Directive, inject } from '@angular/core';
import { MsofIconHostDirective } from './msof-icon-host.directive';

@Directive({
  selector: 'svg[msofIconSvg]',
  host: {
    class: 'msof-icon-svg',
    '[attr.aria-hidden]': "ariaLabel() ? null : 'true'",
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.role]': "ariaLabel() ? 'img' : null",
  },
})
export class MsofIconSvgDirective {
  protected readonly ariaLabel = inject(MsofIconHostDirective).ariaLabel;
}
