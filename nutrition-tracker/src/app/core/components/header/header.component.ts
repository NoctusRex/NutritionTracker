import { Component, Input } from '@angular/core';
import { BaseComponent } from '../base-component/base.component';

@Component({
  templateUrl: './header.component.html',
  selector: 'app-header',
})
export class HeaderComponent {
  @Input() title!: string;
  @Input() canGoBack: boolean = true;
  @Input() canSubmit: boolean = true;
  @Input() disableSubmit: boolean = false;
  @Input() submitIcon: string = 'save';
  @Input() component!: BaseComponent;
}
