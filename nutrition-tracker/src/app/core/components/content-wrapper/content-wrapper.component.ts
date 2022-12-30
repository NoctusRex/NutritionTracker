import { Component, Input } from '@angular/core';

@Component({
  templateUrl: './content-wrapper.component.html',
  selector: 'app-content-wrapper',
})
export class ContentWrapperComponent {
  @Input() padding: number = 4;
}
