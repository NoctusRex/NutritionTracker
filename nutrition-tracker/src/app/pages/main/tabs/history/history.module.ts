import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoryPage } from './history.page';

import { HistoryPageRoutingModule } from './history-routing.module';
import { ComponentsModule } from 'src/app/core/components/component.module';

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HistoryPageRoutingModule,
    ComponentsModule,
  ],
  declarations: [HistoryPage],
})
export class HistoryPageModule {}
