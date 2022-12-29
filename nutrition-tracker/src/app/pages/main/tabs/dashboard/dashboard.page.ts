import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/core/components/base-component/base.component';
import { Location } from '@angular/common';
import { PouchDbService } from 'src/app/core/services/pouch-db.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
})
export class DashboardPage extends BaseComponent {
  constructor(
    router: Router,
    location: Location,
    protected pouchDbService: PouchDbService
  ) {
    super(router, location);
  }

  addPosition(): void {}
}
