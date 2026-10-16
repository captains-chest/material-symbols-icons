import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-pen-size-3-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M218-218q-17-17-17-42t17-42l440-440q17-18 42-17.5t42 17.5q17 17 17.5 42T742-658L302-218q-17 17-42 17.5T218-218Z"/></svg>`,
})
export class MsrPenSize3IconComponent {}
