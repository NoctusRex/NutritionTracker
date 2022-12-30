import { Injectable } from '@angular/core';
import { ItemPosition } from '../models/item-position.model';
import { NutritionFacts } from '../models/nutrition-facts.model';
import { CollectionService } from './collection.service';
import { PouchDbService } from './pouch-db.service';
import { UnitOfMeasureUtilsService } from './unit-of-measure-utils.service';

@Injectable({ providedIn: 'root' })
export class ItemPositionService extends CollectionService<ItemPosition> {
  constructor(
    pouchDbSerive: PouchDbService,
    protected unitOfMeasureUtilsService: UnitOfMeasureUtilsService
  ) {
    super('item-positions', pouchDbSerive);
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
          value.quantity,
          item.units
        ).value;

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
}
