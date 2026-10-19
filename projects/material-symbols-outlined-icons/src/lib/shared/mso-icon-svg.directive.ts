import { Directive, inject } from '@angular/core';
import { MsoIconHostDirective } from './mso-icon-host.directive';

@Directive({
  selector: 'svg[msoIconSvg]',
  host: {
    class: 'mso-icon-svg',
    '[attr.aria-hidden]': "ariaLabel() ? null : 'true'",
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.role]': "ariaLabel() ? 'img' : null",
  },
})
export class MsoIconSvgDirective {
  protected readonly ariaLabel = inject(MsoIconHostDirective).ariaLabel;
}
