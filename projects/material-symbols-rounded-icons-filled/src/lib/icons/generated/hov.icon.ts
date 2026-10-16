import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-hov-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M480-118q-10 0-19-4.5T446-137L265-439q-6-10-9-20t-3-21q0-11 3-21t9-20l181-302q6-10 15-14.5t19-4.5q10 0 19 4.5t15 14.5l181 302q6 10 9 20t3 21q0 11-3 21t-9 20L514-137q-6 10-15 14.5t-19 4.5Z"/></svg>`,
})
export class MsrfHovIconComponent {}
