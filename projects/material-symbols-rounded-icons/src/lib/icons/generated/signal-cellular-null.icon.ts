import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-signal-cellular-null-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M177-80q-27 0-37.5-24.5T148-148l664-664q19-19 43.5-8.5T880-783v643q0 25-17.5 42.5T820-80H177Zm96-80h527v-526L273-160Z"/></svg>`,
})
export class MsrSignalCellularNullIconComponent {}
