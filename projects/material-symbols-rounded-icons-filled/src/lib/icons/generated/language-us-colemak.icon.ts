import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-language-us-colemak-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M580-360h140v-240H580v240Zm-340 80q-33 0-56.5-23.5T160-360v-240q0-33 23.5-56.5T240-680h140q17 0 28.5 11.5T420-640q0 17-11.5 28.5T380-600H240v240h140q17 0 28.5 11.5T420-320q0 17-11.5 28.5T380-280H240Zm340 0q-33 0-56.5-23.5T500-360v-240q0-33 23.5-56.5T580-680h140q33 0 56.5 23.5T800-600v240q0 33-23.5 56.5T720-280H580Z"/></svg>`,
})
export class MsrfLanguageUsColemakIconComponent {}
