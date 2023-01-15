import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/core/components/base-component/base.component';
import { Location } from '@angular/common';
import { StorageService } from 'src/app/core/services/storage.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { ApplicationConfigurationService } from 'src/app/core/services/application-configuration.service';
import { SETTINGS_STORAGE_KEY } from 'src/app/core/consts/storage-keys.const';
import { Settings } from 'src/app/core/models/settings.model';
import { ItemService } from 'src/app/core/services/item.service';
import { ItemPositionService } from 'src/app/core/services/item-position.serivce';
import {
  catchError,
  concatMap,
  forkJoin,
  from,
  last,
  of,
  take,
  tap,
} from 'rxjs';
import { File } from '@ionic-native/file';
import moment from 'moment';
import { Capacitor } from '@capacitor/core';
import { saveAs } from 'file-saver';
import { ItemPosition } from 'src/app/core/models/item-position.model';
import { Item } from 'src/app/core/models/item.model';
import { get, isEmpty } from 'lodash-es';
import { ToastService } from 'src/app/core/services/toast.service';

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
  version!: string;

  constructor(
    router: Router,
    location: Location,
    private storageService: StorageService,
    private translationService: TranslationService,
    private applicationConfigurationService: ApplicationConfigurationService,
    private itemService: ItemService,
    private itemPositionService: ItemPositionService,
    private toastService: ToastService
  ) {
    super(router, location);
  }

  ngOnInit(): void {
    this.languages =
      this.applicationConfigurationService.configuration.translation.languages;

    this.language = this.translationService.language;

    const settings = this.getSettings();
    this.hour = settings.resetHour!;
    this.version = this.applicationConfigurationService.configuration.version;
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

  backup(): void {
    forkJoin([
      this.itemService.values$.pipe(take(1)),
      this.itemPositionService.values$.pipe(take(1)),
    ])
      .pipe(
        concatMap(([items, positions]) => {
          const json: string = JSON.stringify({ items, positions });
          const fileName = `nutrition-tracker-backup-${moment().format(
            'DDMMYYYY'
          )}.json`;

          if (Capacitor.getPlatform() === 'web') {
            this.downloadFile(json, fileName);
            return of(null);
          }

          return of(
            File.writeFile(
              File.externalRootDirectory + '/Download/',
              fileName,
              json,
              {
                replace: true,
              }
            )
          );
        }),
        concatMap(() =>
          this.translationService.translate$(
            'pages.settings.content.BACKUP_SUCCESS'
          )
        ),
        catchError((error) => {
          console.error(error);
          this.showErrorToast(error.message);
          return of(null);
        })
      )
      .subscribe((sucessMessage) => {
        if (isEmpty(sucessMessage) || sucessMessage === null) return;

        this.toastService.show(sucessMessage, { color: 'success' });
      });
  }

  downloadFile(json: string, fileName: string) {
    const blob = new Blob([json], { type: 'text/json' });
    saveAs(blob, fileName);
  }

  restore(file: File): void {
    try {
      let fileReader = new FileReader();
      fileReader.onload = (_e) => {
        try {
          const values = JSON.parse(fileReader.result as string) as {
            items: Array<Item>;
            positions: Array<ItemPosition>;
          };

          if (!values || !get(values, 'items') || !get(values, 'positions'))
            return;

          forkJoin([
            this.itemService.clear$().pipe(
              concatMap(() => from(values.items)),
              concatMap((item) => this.itemService.add$(item)),
              last()
            ),
            this.itemPositionService.clear$().pipe(
              concatMap(() => from(values.positions)),
              concatMap((position) => this.itemPositionService.add$(position)),
              last()
            ),
          ])
            .pipe(
              concatMap(() =>
                this.translationService.translate$(
                  'pages.settings.content.RESTORE_SUCCESS'
                )
              ),
              catchError((error) => {
                console.error(error);
                this.showErrorToast(error.message);
                return of(null);
              })
            )
            .subscribe((sucessMessage) => {
              if (isEmpty(sucessMessage) || sucessMessage === null) return;

              this.toastService.show(sucessMessage, { color: 'success' });
            });
        } catch (error: any) {
          this.showErrorToast(error.message);
        }
      };
      fileReader.readAsText(file);
    } catch (error: any) {
      this.showErrorToast(error.message);
    }
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

  private showErrorToast(message: string): void {
    this.toastService.show(message, { color: 'danger' });
  }
}
