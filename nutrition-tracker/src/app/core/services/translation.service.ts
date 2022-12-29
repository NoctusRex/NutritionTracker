import { ChangeDetectorRef, Injectable } from '@angular/core';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { isEmpty } from 'lodash';
import { Observable } from 'rxjs';
import { SETTINGS_STORAGE_KEY } from '../consts/storage-keys.const';
import { Settings } from '../models/settings.model';
import { ApplicationConfigurationService } from './application-configuration.service';
import { StorageService } from './storage.service';

@Injectable({ providedIn: 'root' })
export class TranslationService {
  private currentLanguage!: string;

  get language(): string {
    return this.currentLanguage;
  }

  constructor(
    private translateService: TranslateService,
    private applicationConfigurationService: ApplicationConfigurationService,
    private storageService: StorageService
  ) {}

  initialize(): void {
    console.log('setting language');

    const browserLang = this.translateService.getBrowserLang();
    const languages =
      this.applicationConfigurationService.configuration.translation.languages;
    const defaultLanguage =
      this.applicationConfigurationService.configuration.translation
        .defaultLanguage;
    const predefinedLanguage = this.storageService.getItem<Settings>(
      SETTINGS_STORAGE_KEY,
      {
        language: undefined,
      }
    ).language;

    this.translateService.addLangs(languages);

    this.translateService.setDefaultLang(defaultLanguage);

    this.setLanguage(
      browserLang &&
        languages.includes(browserLang) &&
        isEmpty(predefinedLanguage)
        ? browserLang
        : isEmpty(predefinedLanguage)
        ? defaultLanguage
        : predefinedLanguage!
    ).subscribe(() => console.log('language is', this.language));
  }

  setLanguage(language: string): Observable<void> {
    console.log('setting language to', language);
    this.currentLanguage = language;
    return this.translateService.use(language);
  }

  translate(
    key: string,
    detectorRef: ChangeDetectorRef,
    args?: Object
  ): string {
    const translatePipe = new TranslatePipe(this.translateService, detectorRef);

    return translatePipe.transform(key, args);
  }

  translate$(key: string, args?: Object): Observable<string> {
    return this.translateService.get(key, args);
  }
}
