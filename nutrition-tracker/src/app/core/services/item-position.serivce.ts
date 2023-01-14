import { Injectable } from '@angular/core';
import moment from 'moment';
import { concatMap, interval, map, Observable, of, take } from 'rxjs';
import { SETTINGS_STORAGE_KEY } from '../consts/storage-keys.const';
import { ItemPosition } from '../models/item-position.model';
import { NutritionFacts } from '../models/nutrition-facts.model';
import { Settings } from '../models/settings.model';
import { CollectionService } from './collection.service';
import { ItemService } from './item.service';
import { PouchDbService } from './pouch-db.service';
import { StorageService } from './storage.service';
import { UnitOfMeasureUtilsService } from './unit-of-measure-utils.service';

@Injectable({ providedIn: 'root' })
export class ItemPositionService extends CollectionService<ItemPosition> {
  constructor(
    pouchDbSerive: PouchDbService,
    protected unitOfMeasureUtilsService: UnitOfMeasureUtilsService,
    protected storageService: StorageService,
    protected itemService: ItemService
  ) {
    super('item-positions', pouchDbSerive);
  }

  get todaysValues$(): Observable<Array<ItemPosition>> {
    return interval(50).pipe(
      concatMap((interval) => {
        return interval % 600 === 0 ? this.refresh$() : of(null);
      }),
      concatMap(() => this.values$.pipe(take(1))),
      map((positions) => {
        return positions.filter((x) => {
          const now = moment();
          const added = moment(x.timeStampAdded);

          return now.diff(added) <= 24 * 60 * 60 * 1000;
        });
      })
    );
  }

  protected override modifyRefreshValue$(
    value: ItemPosition
  ): Observable<ItemPosition> {
    return this.itemService.get$(value.item.id).pipe(
      map((item) => {
        if (!item) return value;

        value.item = item;

        return value;
      })
    );
  }

  getTotal(positions: Array<ItemPosition>): NutritionFacts {
    const fact: NutritionFacts = {
      calories: 0,
      protein: 0,
      saturatedFat: 0,
      sodium: 0,
      sugar: 0,
      totalCarbohydrate: 0,
      totalFat: 0,
      fiber: 0,
    };

    positions.forEach((value) => {
      const item = value.item;
      const quantity =
        this.unitOfMeasureUtilsService.convertToBaseUnitOfMeasure(
          value.quantity!,
          item.units
        ).value;

      if (Number.isNaN(quantity)) return;

      fact.calories! += (item.nutritionFacts.calories! / 100) * quantity;
      fact.protein! += (item.nutritionFacts.protein! / 100) * quantity;
      fact.saturatedFat! +=
        (item.nutritionFacts.saturatedFat! / 100) * quantity;
      fact.sodium! += (item.nutritionFacts.sodium! / 100) * quantity;
      fact.sugar! += (item.nutritionFacts.sugar! / 100) * quantity;
      fact.totalCarbohydrate! +=
        (item.nutritionFacts.totalCarbohydrate! / 100) * quantity;
      fact.totalFat! += (item.nutritionFacts.totalFat! / 100) * quantity;
      fact.fiber! += (item.nutritionFacts.fiber! / 100) * quantity;
    });

    fact.calories = +fact.calories!.toFixed(3);
    fact.protein = +fact.protein!.toFixed(3);
    fact.saturatedFat = +fact.saturatedFat!.toFixed(3);
    fact.sodium = +fact.sodium!.toFixed(3);
    fact.sugar = +fact.sugar!.toFixed(3);
    fact.totalCarbohydrate = +fact.totalCarbohydrate!.toFixed(3);
    fact.totalFat = +fact.totalFat!.toFixed(3);
    fact.fiber = +fact.fiber!.toFixed(3);

    return fact;
  }

  private getSettings(): Settings {
    return this.storageService.getItem<Settings>(
      SETTINGS_STORAGE_KEY,
      {
        resetHour: 24,
      },
      false
    );
  }
}
