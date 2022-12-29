import { HttpClient, HttpClientModule } from '@angular/common/http';
import { APP_INITIALIZER, NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { RouteReuseStrategy } from '@angular/router';
import { IonicModule, IonicRouteStrategy } from '@ionic/angular';
import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { TranslateHttpLoader } from '@ngx-translate/http-loader';
import { APP_BASE_HREF, PlatformLocation } from '@angular/common';
import { ApplicationConfigurationService } from './core/services/application-configuration.service';
import { TranslationService } from './core/services/translation.service';
import { forkJoin } from 'rxjs';
import { ReactiveFormsModule } from '@angular/forms';
import { TranslateLoader, TranslateModule } from '@ngx-translate/core';

// AoT requires an exported function for factories
export function HttpLoaderFactory(httpClient: HttpClient, baseHref: string) {
  return new TranslateHttpLoader(httpClient, `${baseHref}assets/i18n/`);
}

export function getBaseHref(platformLocation: PlatformLocation): string {
  return platformLocation.getBaseHrefFromDOM();
}

function initializeAppFactory(
  applicationConfigurationService: ApplicationConfigurationService,
  translationService: TranslationService
): () => any {
  return () => {
    forkJoin([applicationConfigurationService.initialize$()]).subscribe(() =>
      translationService.initialize()
    );
  };
}

@NgModule({
  declarations: [AppComponent],
  imports: [
    BrowserModule,
    IonicModule.forRoot(),
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: HttpLoaderFactory,
        deps: [HttpClient, APP_BASE_HREF],
      },
    }),
  ],
  providers: [
    { provide: RouteReuseStrategy, useClass: IonicRouteStrategy },
    {
      provide: APP_BASE_HREF,
      useFactory: getBaseHref,
      deps: [PlatformLocation],
    },
    {
      provide: APP_INITIALIZER,
      useFactory: initializeAppFactory,
      deps: [ApplicationConfigurationService, TranslationService],
      multi: true,
    },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
