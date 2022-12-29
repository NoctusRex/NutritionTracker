import { APP_BASE_HREF } from '@angular/common';
import { HttpClient } from '@angular/common/http';
import { Inject, Injectable } from '@angular/core';
import { ApplicationConfiguration } from '../models/application-configuration.model';
import { ConfigurationService } from './configuration.service';

@Injectable({ providedIn: 'root' })
export class ApplicationConfigurationService extends ConfigurationService<ApplicationConfiguration> {
  constructor(httpClient: HttpClient, @Inject(APP_BASE_HREF) baseHref: string) {
    super(httpClient, baseHref, 'application');
  }
}
