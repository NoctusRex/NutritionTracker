import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/core/components/base-component/base.component';
import { Location } from '@angular/common';
import { StorageService } from 'src/app/core/services/storage.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { ApplicationConfigurationService } from 'src/app/core/services/application-configuration.service';
import { SETTINGS_STORAGE_KEY } from 'src/app/core/consts/storage-keys.const';
import { Settings } from 'src/app/core/models/settings.model';

@Component({
  selector: 'app-settings',
  templateUrl: 'settings.page.html',
})
export class SettingsPage extends BaseComponent implements OnInit {
  languages: Array<string> = [];
  language!: string;
  hours = [
    1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13, 14, 15, 16, 17, 18, 19, 20, 21,
    22, 23, 24,
  ];
  hour!: number;

  constructor(
    router: Router,
    location: Location,
    private storageService: StorageService,
    private translationService: TranslationService,
    private applicationConfigurationService: ApplicationConfigurationService
  ) {
    super(router, location);
  }

  ngOnInit(): void {
    this.languages =
      this.applicationConfigurationService.configuration.translation.languages;

    this.language = this.translationService.language;

    const settings = this.getSettings();
    this.hour = settings.resetHour!;
  }

  onLanguageChange(ev: any): void {
    this.translationService.setLanguage(ev.target.value).subscribe();

    const settings = this.getSettings();
    settings.language = this.language;
    this.storageService.setItem(SETTINGS_STORAGE_KEY, settings);
  }

  onHourChange(_ev: any): void {
    const settings = this.getSettings();
    settings.resetHour = this.hour;
    this.storageService.setItem(SETTINGS_STORAGE_KEY, settings);
  }

  override goBack(): void {
    this.navigate('dashboard');
  }

  private getSettings(): Settings {
    return this.storageService.getItem<Settings>(SETTINGS_STORAGE_KEY, {
      language: this.language,
      resetHour: 24,
    });
  }
}
