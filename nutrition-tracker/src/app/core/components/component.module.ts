import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { TranslateModule } from '@ngx-translate/core';
import { ContentWrapperComponent } from './content-wrapper/content-wrapper.component';
import { FileUploadComponent } from './file-upload/file-upload.component';
import { HeaderComponent } from './header/header.component';
import { NutritionFactsComponent } from './nutrition-facts/nutrition-facts.component';

@NgModule({
  imports: [
    CommonModule,
    IonicModule.forRoot(),
    TranslateModule.forChild(),
    ReactiveFormsModule,
    FormsModule,
  ],
  declarations: [
    ContentWrapperComponent,
    HeaderComponent,
    NutritionFactsComponent,
    FileUploadComponent,
  ],
  exports: [
    ContentWrapperComponent,
    HeaderComponent,
    NutritionFactsComponent,
    FileUploadComponent,
  ],
})
export class ComponentsModule {}
