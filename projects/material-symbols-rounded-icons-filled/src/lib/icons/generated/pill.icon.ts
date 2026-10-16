import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-pill-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="m668-349 106-107q32-32 49-73t17-86q0-94-65.5-159.5T615-840q-45 0-86 17t-73 49L349-668l319 319ZM345-120q45 0 86-17t73-49l107-106-319-319-106 107q-32 32-49 73t-17 86q0 94 65.5 159.5T345-120Z"/></svg>`,
})
export class MsrfPillIconComponent {}
