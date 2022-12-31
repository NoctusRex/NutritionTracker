import { Injectable } from '@angular/core';
import { add } from 'lodash';
import moment from 'moment';
import {
  concatMap,
  filter,
  forkJoin,
  from,
  interval,
  map,
  Observable,
  take,
  tap,
  toArray,
} from 'rxjs';
import { SETTINGS_STORAGE_KEY } from '../consts/storage-keys.const';
import { ItemPosition } from '../models/item-position.model';
import { NutritionFacts } from '../models/nutrition-facts.model';
import { Settings } from '../models/settings.model';
import { ApplicationConfigurationService } from './application-configuration.service';
import { CollectionService } from './collection.service';
import { PouchDbService } from './pouch-db.service';
import { StorageService } from './storage.service';
import { UnitOfMeasureUtilsService } from './unit-of-measure-utils.service';

@Injectable({ providedIn: 'root' })
export class ItemPositionService extends CollectionService<ItemPosition> {
  constructor(
    pouchDbSerive: PouchDbService,
    protected unitOfMeasureUtilsService: UnitOfMeasureUtilsService,
    protected storageService: StorageService
  ) {
    super('item-positions', pouchDbSerive);
  }

  get todaysValues$(): Observable<Array<ItemPosition>> {
    return interval(1000).pipe(
      concatMap(() => this.values$.pipe(take(1))),
      map((positions) => {
        const settings = this.getSettings();

        return positions.filter((x) => {
          const now = moment();
          const dayNow = now.day();
          const monthNow = now.month();
          const yearNow = now.year();

          const added = moment(x.timeStampAdded);
          const dayAdded = added.day();
          const monthAdded = added.month();
          const yearAdded = added.year();
          const hourAdded = added.hour() === 0 ? 24 : added.hour();

          if (yearNow > yearAdded) return false;
          if (monthNow > monthAdded) return false;
          if (dayNow > dayAdded) return false;
          if (hourAdded < settings.resetHour!) return true;

          return false;
        });
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
    });

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
