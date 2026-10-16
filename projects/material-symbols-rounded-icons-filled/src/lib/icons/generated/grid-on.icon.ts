import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-grid-on-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M200-120h107v-187H120v107q0 33 23.5 56.5T200-120Zm187 0h186v-187H387v187Zm266 0h107q33 0 56.5-23.5T840-200v-107H653v187ZM120-387h187v-186H120v186Zm267 0h186v-186H387v186Zm266 0h187v-186H653v186ZM120-653h187v-187H200q-33 0-56.5 23.5T120-760v107Zm267 0h186v-187H387v187Zm266 0h187v-107q0-33-23.5-56.5T760-840H653v187Z"/></svg>`,
})
export class MsrfGridOnIconComponent {}
