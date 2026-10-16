import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-pie-chart-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M520-520v-356q143 15 241.5 114T876-520H520ZM441-85q-152-15-254.5-128T84-480q0-155 102.5-268T441-876v791Zm79 0v-356h356q-14 143-113.5 242.5T520-85Z"/></svg>`,
})
export class MsrfPieChartIconComponent {}
