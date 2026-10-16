import { Component } from '@angular/core';
import { MsrIconHostDirective } from '../../shared/msr-icon-host.directive';
import { MsrIconSvgDirective } from '../../shared/msr-icon-svg.directive';

@Component({
  selector: 'msr-label-important-icon',
  imports: [MsrIconSvgDirective],
  hostDirectives: [{ directive: MsrIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M267-200q-48 0-71-41.5t3-81.5l101-157-101-157q-26-40-3-81.5t71-41.5h333q20 0 37.5 9t28.5 25l141 200q15 21 15 46t-15 46L666-234q-11 16-28.5 25t-37.5 9H267Zm333-80 142-200-142-200H266l102 156q13 20 13 44t-13 44L266-280h334Zm-96-200Z"/></svg>`,
})
export class MsrLabelImportantIconComponent {}
