import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-stat-2-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M480-407 324-252q-11 11-27.5 11.5T268-252q-11-11-11-28t11-28l155-155q23-23 57-23t57 23l155 155q11 11 11.5 27.5T692-252q-11 11-28 11t-28-11L480-407Zm0-240L324-492q-11 11-27.5 11.5T268-492q-11-11-11-28t11-28l155-155q23-23 57-23t57 23l155 155q11 11 11.5 27.5T692-492q-11 11-28 11t-28-11L480-647Z"/></svg>`,
})
export class MsrfStat2IconComponent {}
