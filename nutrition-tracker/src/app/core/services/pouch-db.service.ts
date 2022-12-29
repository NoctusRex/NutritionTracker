import { Injectable } from '@angular/core';
import { concatMap, from, map, Observable } from 'rxjs';
import { PouchDbData } from '../models/pouch-db-data.model';
import PouchDB from 'pouchdb';

@Injectable({ providedIn: 'root' })
export class PouchDbService {
  private db;

  constructor() {
    this.db = new PouchDB('nutrition-tracker');
  }

  put$(key: string, value: any): Observable<void> {
    return this.internalGet$(key).pipe(
      concatMap((existing) => {
        let dataToPut = { _id: key, data: value } as PouchDbData;

        if (existing) {
          dataToPut = existing;
          dataToPut.data = value;
        }

        return from(this.db.put(dataToPut)).pipe(
          map(() => {
            return;
          })
        );
      })
    );
  }

  get$<T>(key: string): Observable<T> {
    return this.internalGet$(key).pipe(map((x) => x.data.data as T));
  }

  remove$(key: string): Observable<void> {
    return this.internalGet$(key).pipe(
      concatMap((data) => this.internalRemove$(data._id, data._rev!))
    );
  }

  private internalGet$<T>(key: string): Observable<PouchDbData> {
    return from(this.db.get<T>(key)).pipe(
      map((x) => ({ _id: x._id, _rev: x._rev, data: x } as PouchDbData))
    );
  }

  private internalRemove$(id: string, rev: string): Observable<void> {
    return from(this.db.remove({ _id: id, _rev: rev })).pipe(
      map(() => {
        return;
      })
    );
  }
}
