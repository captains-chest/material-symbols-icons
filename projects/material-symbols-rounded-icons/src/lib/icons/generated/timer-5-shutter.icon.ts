import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-timer-5-shutter-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M560-200H380q-25 0-42.5-17.5T320-260q0-25 17.5-42.5T380-320h180v-100H380q-25 0-42.5-17.5T320-480v-220q0-25 17.5-42.5T380-760h240q25 0 42.5 17.5T680-700q0 25-17.5 42.5T620-640H440v100h120q50 0 85 35t35 85v100q0 50-35 85t-85 35Z"/></svg>`,
})
export class MsrTimer5ShutterIconComponent {}
