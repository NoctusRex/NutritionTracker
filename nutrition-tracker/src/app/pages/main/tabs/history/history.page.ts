import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/core/components/base-component/base.component';
import { Location } from '@angular/common';

@Component({
  selector: 'app-history',
  templateUrl: 'history.page.html',
})
export class HistoryPage extends BaseComponent {
  constructor(router: Router, location: Location) {
    super(router, location);
  }
}
