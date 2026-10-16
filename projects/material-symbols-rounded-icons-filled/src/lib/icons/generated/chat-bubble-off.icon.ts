import { Component } from '@angular/core';
import { MsrfIconHostDirective } from '../../shared/msrf-icon-host.directive';
import { MsrfIconSvgDirective } from '../../shared/msrf-icon-svg.directive';

@Component({
  selector: 'msrf-chat-bubble-off-icon',
  imports: [MsrfIconSvgDirective],
  hostDirectives: [{ directive: MsrfIconHostDirective, inputs: ['ariaLabel'] }],
  template: `<svg msrfIconSvg focusable="false" viewBox="0 -960 960 960"><path d="M880-800v509q0 27-24.5 37.5T812-262L262-812q-19-19-8.5-43.5T291-880h509q33 0 56.5 23.5T880-800ZM240-240l-92 92q-19 19-43.5 8.5T80-177v-591l-24-24q-11-11-11-28t11-28q11-11 28-11t28 11l736 736q11 11 11.5 27.5T848-56q-11 11-28 11t-28-11L606-240H240Z"/></svg>`,
})
export class MsrfChatBubbleOffIconComponent {}
