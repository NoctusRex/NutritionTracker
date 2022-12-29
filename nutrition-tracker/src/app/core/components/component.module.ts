import { CommonModule } from '@angular/common';
import { NgModule } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { ContentWrapperComponent } from './content-wrapper/content-wrapper.component';

@NgModule({
  imports: [CommonModule, IonicModule.forRoot()],
  declarations: [ContentWrapperComponent],
  exports: [ContentWrapperComponent],
})
export class ComponentsModule {}
