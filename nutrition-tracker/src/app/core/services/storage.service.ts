import { Injectable } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class StorageService {
  private readonly keyPrefix = 'nutrition-tracker';

  constructor() {}

  public setItem(key: string, data: any): void {
    console.log('Storage: setting', key, 'to', data);
    localStorage.setItem(`${this.keyPrefix}-${key}`, JSON.stringify(data));
  }

  public getItem<T>(key: string, defaultValue?: T, doLog = true): T {
    const item = localStorage.getItem(`${this.keyPrefix}-${key}`);
    const value = item ? JSON.parse(item) || defaultValue : defaultValue;

    if (doLog) console.log('Storage: getting', key, value);

    return value;
  }

  public removeItem(key: string): void {
    console.log('Storage: deleting', key);
    localStorage.removeItem(`${this.keyPrefix}-${key}`);
  }

  public clear() {
    console.log('Storage: clearing');
    localStorage.clear();
  }
}
