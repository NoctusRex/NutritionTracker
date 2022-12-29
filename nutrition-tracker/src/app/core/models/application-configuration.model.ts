import { TranslationConfiguration } from './translation-configuration.model';

export interface ApplicationConfiguration {
  version: string;
  translation: TranslationConfiguration;
}
