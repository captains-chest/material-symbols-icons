import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-location-automation-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 0 24 24"><path d="M4 19V7l8-6 8 6v4h-2V8l-6-4.5L6 8v9h6v2Zm14.5 3-1.4-3.1-3.1-1.4 3.1-1.4 1.4-3.1 1.4 3.1 3.1 1.4-3.1 1.4Z"/></svg>`,
})
export class MsrLocationAutomationIconComponent {}
