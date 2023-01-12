import { IonicModule } from '@ionic/angular';
import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { HistoryPage } from './history.page';

import { HistoryPageRoutingModule } from './history-routing.module';
import { ComponentsModule } from 'src/app/core/components/component.module';

import * as PlotlyJS from 'plotly.js-dist-min';
import { PlotlyModule } from 'angular-plotly.js';
import { TranslateModule } from '@ngx-translate/core';

PlotlyModule.plotlyjs = PlotlyJS;

@NgModule({
  imports: [
    IonicModule,
    CommonModule,
    FormsModule,
    HistoryPageRoutingModule,
    ComponentsModule,
    PlotlyModule,
    TranslateModule.forChild(),
  ],
  declarations: [HistoryPage],
})
export class HistoryPageModule {}
