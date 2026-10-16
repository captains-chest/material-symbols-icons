import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-density-small-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M160-80q-17 0-28.5-11.5T120-120q0-17 11.5-28.5T160-160h640q17 0 28.5 11.5T840-120q0 17-11.5 28.5T800-80H160Zm0-240q-17 0-28.5-11.5T120-360q0-17 11.5-28.5T160-400h640q17 0 28.5 11.5T840-360q0 17-11.5 28.5T800-320H160Zm0-240q-17 0-28.5-11.5T120-600q0-17 11.5-28.5T160-640h640q17 0 28.5 11.5T840-600q0 17-11.5 28.5T800-560H160Zm0-240q-17 0-28.5-11.5T120-840q0-17 11.5-28.5T160-880h640q17 0 28.5 11.5T840-840q0 17-11.5 28.5T800-800H160Z"/></svg>`,
})
export class MsrfDensitySmallIconComponent {}
