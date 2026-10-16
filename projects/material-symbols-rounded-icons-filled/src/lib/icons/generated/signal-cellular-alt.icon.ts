import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-signal-cellular-alt-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M260-160q-25 0-42.5-17.5T200-220v-120q0-25 17.5-42.5T260-400q25 0 42.5 17.5T320-340v120q0 25-17.5 42.5T260-160Zm240 0q-25 0-42.5-17.5T440-220v-320q0-25 17.5-42.5T500-600q25 0 42.5 17.5T560-540v320q0 25-17.5 42.5T500-160Zm240 0q-25 0-42.5-17.5T680-220v-520q0-25 17.5-42.5T740-800q25 0 42.5 17.5T800-740v520q0 25-17.5 42.5T740-160Z"/></svg>`,
})
export class MsrfSignalCellularAltIconComponent {}
