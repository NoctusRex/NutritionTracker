import { Injectable, OnInit } from '@angular/core';
import { catchError, concatMap, from, map, Observable, of } from 'rxjs';
import { PouchDbData } from '../models/pouch-db-data.model';
import PouchDB from 'pouchdb';

@Injectable({ providedIn: 'root' })
export class PouchDbService implements OnInit {
  private db;

  onChange$!: Observable<void>;

  constructor() {
    this.db = new PouchDB('nutrition-tracker');
  }

  ngOnInit(): void {
    this.onChange$ = from(
      this.db.changes({ since: 'now', live: true, include_docs: true })
    ).pipe(
      map(() => {
        return;
      })
    );
  }

  put$(key: string, value: any): Observable<void> {
    return this.internalGet$(key).pipe(
      catchError(() => of(undefined)),
      concatMap((existing) => {
        let dataToPut = { _id: key, data: value } as PouchDbData;

        if (existing) {
          dataToPut = existing;
          dataToPut.data = value;
        }

        console.log('PouchDb - put', key, value);

        return from(this.db.put(dataToPut)).pipe(
          map(() => {
            return;
          })
        );
      })
    );
  }

  get$<T>(key: string): Observable<T> {
    return this.internalGet$(key).pipe(
      map((x) => {
        console.log('PouchDb - get', key, x.data.data);

        return x.data.data as T;
      })
    );
  }

  remove$(key: string): Observable<void> {
    console.log('PouchDb - remove', key);

    return this.internalGet$(key).pipe(
      concatMap((data) => this.internalRemove$(data._id, data._rev!))
    );
  }

  private internalGet$<T>(key: string): Observable<PouchDbData> {
    return from(this.db.get<T>(key)).pipe(
      map((x) => {
        return { _id: x._id, _rev: x._rev, data: x } as PouchDbData;
      })
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
