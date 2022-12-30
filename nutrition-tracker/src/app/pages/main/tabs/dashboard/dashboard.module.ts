import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DashboardPage } from './dashboard.page';

import { DashboardPageRoutingModule } from './dashboard-routing.module';
import { ComponentsModule } from 'src/app/core/components/component.module';
import { TranslateModule } from '@ngx-translate/core';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    DashboardPageRoutingModule,
    ComponentsModule,
    TranslateModule.forChild(),
  ],
  declarations: [DashboardPage],
})
export class DashboardPageModule {}
