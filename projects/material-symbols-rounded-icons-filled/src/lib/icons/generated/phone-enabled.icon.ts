import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-phone-enabled-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M162-120q-18 0-30-12t-12-30v-162q0-13 9-23.5t23-14.5l138-28q14-2 28.5 2.5T342-374l94 94q38-22 72-48.5t65-57.5q33-32 60.5-66.5T681-524l-97-98q-8-8-11-19t-1-27l26-140q2-13 13-22.5t25-9.5h162q18 0 30 12t12 30q0 125-54.5 247T631-329Q531-229 409-174.5T162-120Z"/></svg>`,
})
export class MsrfPhoneEnabledIconComponent {}
