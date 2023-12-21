import { Component, ViewEncapsulation } from '@angular/core';
import { APP_CONSTANT } from './app.constant';

@Component({
  selector: 'policy-mgmt-root',
  templateUrl: './app.component.html',
  styleUrls: [
    '../../node_modules/tc-styles/dist/scss/main.scss'
  ],
  encapsulation: ViewEncapsulation.None
})
export class AppComponent {

  constructor() {
    window['CONFIG'] = APP_CONSTANT.config;
  }
}
