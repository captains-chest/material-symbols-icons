import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-cloud-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M260-160q-91 0-155.5-63T40-377q0-78 47-139t123-78q25-92 100-149t170-57q117 0 198.5 81.5T760-520q69 8 114.5 59.5T920-340q0 75-52.5 127.5T740-160H260Z"/></svg>`,
})
export class MsrfCloudIconComponent {}
