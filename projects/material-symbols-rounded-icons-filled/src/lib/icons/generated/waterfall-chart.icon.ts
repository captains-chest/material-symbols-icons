import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-waterfall-chart-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M180-160q-25 0-42.5-17.5T120-220v-120q0-25 17.5-42.5T180-400q25 0 42.5 17.5T240-340v120q0 25-17.5 42.5T180-160Zm200-240q-25 0-42.5-17.5T320-460v-80q0-25 17.5-42.5T380-600q25 0 42.5 17.5T440-540v80q0 25-17.5 42.5T380-400Zm200-200q-25 0-42.5-17.5T520-660v-80q0-25 17.5-42.5T580-800q25 0 42.5 17.5T640-740v80q0 25-17.5 42.5T580-600Zm200 440q-25 0-42.5-17.5T720-220v-520q0-25 17.5-42.5T780-800q25 0 42.5 17.5T840-740v520q0 25-17.5 42.5T780-160Z"/></svg>`,
})
export class MsrfWaterfallChartIconComponent {}
