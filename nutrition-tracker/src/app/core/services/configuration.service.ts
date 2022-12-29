import { Inject } from '@angular/core';
import { cloneDeep } from 'lodash';
import { HttpClient } from '@angular/common/http';
import { APP_BASE_HREF } from '@angular/common';
import { map, Observable } from 'rxjs';

export abstract class ConfigurationService<T> {
  private _configuration!: T;

  get configuration(): T {
    return cloneDeep(this._configuration);
  }

  constructor(
    private httpClient: HttpClient,
    @Inject(APP_BASE_HREF) private baseHref: string,
    private configurationKey: string
  ) {}

  initialize$(): Observable<void> {
    console.log('loading configuration', this.configurationKey);

    return this.httpClient
      .get(
        `${this.baseHref}assets/configurations/${this.configurationKey}.config.json`
      )
      .pipe(
        map((json) => {
          console.log('configuration', this.configurationKey, 'loaded');
          this._configuration = json as T;
        })
      );
  }
}
