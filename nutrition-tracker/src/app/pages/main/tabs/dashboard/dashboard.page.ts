import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/core/components/base-component/base.component';
import { Location } from '@angular/common';
import { ItemPositionService } from 'src/app/core/services/item-position.serivce';
import { map, Observable } from 'rxjs';
import { ItemPosition } from 'src/app/core/models/item-position.model';
import { NutritionFacts } from 'src/app/core/models/nutrition-facts.model';
import { UnitOfMeasureUtilsService } from 'src/app/core/services/unit-of-measure-utils.service';

@Component({
  selector: 'app-dashboard',
  templateUrl: 'dashboard.page.html',
})
export class DashboardPage extends BaseComponent implements OnInit {
  values$!: Observable<Array<ItemPosition>>;
  totalNutritionFacts$!: Observable<NutritionFacts>;

  constructor(
    router: Router,
    location: Location,
    protected itemPositionService: ItemPositionService,
    protected unitOfMeasureUtilsService: UnitOfMeasureUtilsService
  ) {
    super(router, location);
  }

  ngOnInit(): void {
    this.values$ = this.itemPositionService.values$;

    this.totalNutritionFacts$ = this.values$.pipe(
      map((values) => {
        const fact: NutritionFacts = {
          calories: 0,
          protein: 0,
          saturatedFat: 0,
          sodium: 0,
          sugar: 0,
          totalCarbohydrate: 0,
          totalFat: 0,
        };

        values.forEach((value) => {
          const item = value.item;
          const quantity =
            this.unitOfMeasureUtilsService.convertToBaseUnitOfMeasure(
              value.quantity,
              item.units
            ).value;

          fact.calories += (item.nutritionFacts.calories / 100) * quantity;
          fact.protein += (item.nutritionFacts.protein / 100) * quantity;
          fact.saturatedFat +=
            (item.nutritionFacts.saturatedFat / 100) * quantity;
          fact.sodium += (item.nutritionFacts.sodium / 100) * quantity;
          fact.sugar += (item.nutritionFacts.sugar / 100) * quantity;
          fact.totalCarbohydrate +=
            (item.nutritionFacts.totalCarbohydrate / 100) * quantity;
          fact.totalFat += (item.nutritionFacts.totalFat / 100) * quantity;
        });

        return fact;
      })
    );
  }

  addPosition(): void {}

  openPosition(position: ItemPosition): void {}

  removePosition(position: ItemPosition): void {
    this.itemPositionService.remove$(position).subscribe();
  }
}
