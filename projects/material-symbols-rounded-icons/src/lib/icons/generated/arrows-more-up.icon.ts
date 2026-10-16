import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-arrows-more-up-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M520-200q-17 0-28.5-11.5T480-240v-320H160q-17 0-28.5-11.5T120-600q0-17 11.5-28.5T160-640h360q17 0 28.5 11.5T560-600v360q0 17-11.5 28.5T520-200Zm200-200q-17 0-28.5-11.5T680-440v-320H360q-17 0-28.5-11.5T320-800q0-17 11.5-28.5T360-840h360q17 0 28.5 11.5T760-800v360q0 17-11.5 28.5T720-400Z"/></svg>`,
})
export class MsrArrowsMoreUpIconComponent {}
