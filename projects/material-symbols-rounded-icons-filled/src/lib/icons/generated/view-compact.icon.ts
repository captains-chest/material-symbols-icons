import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-view-compact-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M880-170v-620 620ZM80-610v-180h170v180H80Zm210 0v-180h170v180H290Zm210 0v-180h170v180H500Zm210 0v-180h170v180H710Zm0 220v-180h170v180H710Zm-210 0v-180h170v180H500Zm-210 0v-180h170v180H290Zm-210 0v-180h170v180H80Zm630 220v-180h170v180H710Zm-210 0v-180h170v180H500Zm-210 0v-180h170v180H290Zm-210 0v-180h170v180H80Z"/></svg>`,
})
export class MsrfViewCompactIconComponent {}
