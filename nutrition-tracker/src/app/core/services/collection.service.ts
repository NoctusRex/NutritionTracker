import { Injectable } from '@angular/core';
import { first, isEmpty, last } from 'lodash-es';
import {
  BehaviorSubject,
  catchError,
  concatMap,
  forkJoin,
  from,
  map,
  Observable,
  of,
  take,
  last as rxjs_last,
  toArray,
  tap,
} from 'rxjs';
import { PouchDbService } from './pouch-db.service';

@Injectable({ providedIn: 'root' })
export abstract class CollectionService<T extends Partial<{ id: string }>> {
  private _values$ = new BehaviorSubject<Array<T>>([]);

  get values$(): Observable<Array<T>> {
    return (
      isEmpty(this._values$.value)
        ? this.refresh$()
        : of(null).pipe(
            map(() => {
              return;
            })
          )
    ).pipe(concatMap(() => this._values$.asObservable()));
  }

  constructor(protected key: string, protected pouchDbSerive: PouchDbService) {}

  refresh$(): Observable<void> {
    return this.beforeRefresh$().pipe(
      concatMap(() => this.pouchDbSerive.get$<Array<T>>(this.key)),
      catchError((error) => {
        console.debug('Collection service - refresh error', this.key, error);

        return of([]);
      }),
      concatMap((data) => from(data)),
      concatMap((value) => this.modifyRefreshValue$(value)),
      toArray(),
      map((data) => {
        console.log('Collection service - refresh', this.key, data);

        this._values$.next(data);
        return;
      })
    );
  }

  protected modifyRefreshValue$(value: T): Observable<T> {
    return of(value);
  }

  protected beforeRefresh$(): Observable<void> {
    return of(null).pipe(
      map(() => {
        return;
      })
    );
  }

  add$(value: T): Observable<void> {
    console.log('Collection service - add', this.key, value);

    return forkJoin([this._values$.pipe(take(1)), this.get$(value.id!)]).pipe(
      concatMap(([values, existing]) => {
        if (existing) {
          throw new Error(
            `Collection service - Value already added ${this.key} ${value.id}`
          );
        }
        values.push(value);

        return this.pouchDbSerive.put$(this.key, values);
      }),
      concatMap(() => this.refresh$())
    );
  }

  remove$(value: T): Observable<void> {
    console.log('Collection service - remove', this.key, value);

    return this._values$.pipe(
      take(1),
      concatMap((values) => {
        values = values.filter((x) => x.id !== value.id);

        return this.pouchDbSerive.put$(this.key, values);
      }),
      concatMap(() => this.refresh$())
    );
  }

  update$(value: T): Observable<void> {
    console.log('Collection service - update', this.key, value);

    return this._values$.pipe(
      take(1),
      concatMap((values) => {
        const existingpulse = first(
          values.filter((x) => x.id === value.id)
        ) as T;

        Object.assign(existingpulse, value);

        return this.pouchDbSerive.put$(this.key, values);
      }),
      concatMap(() => this.refresh$())
    );
  }

  get$(id: string): Observable<T> {
    console.log('Collection service - get', this.key, id);

    return this._values$.pipe(
      take(1),
      map((values) => {
        return first(values.filter((x) => x.id === id)) as T;
      })
    );
  }

  clear$(): Observable<void> {
    console.log('Collection service - clear', this.key);

    if (isEmpty(this._values$.value))
      return of(null).pipe(
        map(() => {
          return;
        })
      );

    return from(this._values$.value).pipe(
      concatMap((value) => this.remove$(value)),
      rxjs_last(),
      map(() => {
        this._values$.next([]);
        return;
      })
    );
  }
}
