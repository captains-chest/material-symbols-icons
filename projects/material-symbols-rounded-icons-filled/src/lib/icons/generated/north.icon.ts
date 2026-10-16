import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-north-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M480-80q-17 0-28.5-11.5T440-120v-607L284-572q-11 11-27.5 11.5T228-572q-11-11-11-28t11-28l224-224q6-6 13-8.5t15-2.5q8 0 15 2.5t13 8.5l224 224q11 11 11 27.5T732-572q-12 12-28.5 12T675-572L520-727v607q0 17-11.5 28.5T480-80Z"/></svg>`,
})
export class MsrfNorthIconComponent {}
