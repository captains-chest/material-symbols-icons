import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-flowchart-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M600-160v-80H440v-200h-80v80H80v-240h280v80h80v-200h160v-80h280v240H600v-80h-80v320h80v-80h280v240H600Zm80-80h120v-80H680v80ZM160-440h120v-80H160v80Zm520-200h120v-80H680v80Zm0 400v-80 80ZM280-440v-80 80Zm400-200v-80 80Z"/></svg>`,
})
export class MsrFlowchartIconComponent {}
