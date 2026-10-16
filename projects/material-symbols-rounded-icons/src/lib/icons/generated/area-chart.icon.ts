import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-area-chart-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="m546-787 134 107h80q33 0 56.5 23.5T840-600v440H120v-440q0-25 22-36t42 4l96 72 151-211q20-28 54-33t61 17ZM200-520v144l120 96 160-220 280 218v-318H652L496-725 298-447l-98-73Z"/></svg>`,
})
export class MsrAreaChartIconComponent {}
