import { Directive, inject } from '@angular/core';
import { MssfIconHostDirective } from './mssf-icon-host.directive';

@Directive({
  selector: 'svg[mssfIconSvg]',
  host: {
    class: 'mssf-icon-svg',
    '[attr.aria-hidden]': "ariaLabel() ? null : 'true'",
    '[attr.aria-label]': 'ariaLabel()',
    '[attr.role]': "ariaLabel() ? 'img' : null",
  },
})
export class MssfIconSvgDirective {
  protected readonly ariaLabel = inject(MssfIconHostDirective).ariaLabel;
}
