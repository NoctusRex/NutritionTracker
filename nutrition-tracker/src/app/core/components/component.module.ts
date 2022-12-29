import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ContentWrapperComponent } from './content-wrapper/content-wrapper.component';
import { HeaderComponent } from './header/header.component';
import { NutritionFactsComponent } from './nutrition-facts/nutrition-facts.component';

@NgModule({
  imports: [CommonModule, IonicModule.forRoot(), TranslateModule.forChild()],
  declarations: [
    ContentWrapperComponent,
    HeaderComponent,
    NutritionFactsComponent,
  ],
  exports: [ContentWrapperComponent, HeaderComponent, NutritionFactsComponent],
})
export class ComponentsModule {}
