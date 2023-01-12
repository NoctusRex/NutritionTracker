import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from 'src/app/core/components/base-component/base.component';
import { Location } from '@angular/common';
import { ModalService } from 'src/app/core/services/modal.service';
import { ItemService } from 'src/app/core/services/item.service';
import { concatMap, map, Observable, of } from 'rxjs';
import { Item } from 'src/app/core/models/item.model';
import { cloneDeep } from 'lodash-es';
import { UnitOfMeasureUtilsService } from 'src/app/core/services/unit-of-measure-utils.service';
import { TranslationService } from 'src/app/core/services/translation.service';
import { ItemPosition } from 'src/app/core/models/item-position.model';
import { FoodModalPageComponent } from '../food/food-modal.page';
import { NutritionFacts } from 'src/app/core/models/nutrition-facts.model';
import { ItemPositionService } from 'src/app/core/services/item-position.serivce';

@Component({
  selector: 'app-food-quantity-modal-page',
  templateUrl: 'food-quantity-modal.page.html',
})
export class FoodQuantityModalPageComponent
  extends BaseComponent
  implements OnInit
{
  @Input() position!: ItemPosition;

  unit!: string;
  quantity!: number;

  isNewQuantity!: boolean;

  constructor(
    router: Router,
    location: Location,
    private modalService: ModalService,
    private unitOfMeasureUtils: UnitOfMeasureUtilsService,
    private translationService: TranslationService,
    private itemService: ItemService,
    private itemPositionService: ItemPositionService
  ) {
    super(router, location);
  }

  ngOnInit(): void {
    if (this.position.quantity) {
      this.unit = this.position.quantity.unit;
      this.quantity = this.position.quantity.value;

      this.isNewQuantity = false;

      return;
    }

    this.unit = this.position.item.units.find((x) => x.isBase)?.id!;
    this.isNewQuantity = true;
  }

  override goBack(): void {
    return this.modalService.cancel();
  }

  override submit(): void {
    this.modalService.dismiss(
      cloneDeep({
        ...this.position,
        quantity: { value: this.quantity, unit: this.unit },
      })
    );
  }

  canSubmit(): boolean {
    return this.quantity > 0 && this.isUnitOfMeasureValid();
  }

  openItem(): void {
    this.modalService
      .show$<Item>({
        component: FoodModalPageComponent,
        componentProps: { item: cloneDeep(this.position.item) },
      })
      .pipe(
        concatMap((result) => {
          if (!result.data) {
            if (this.isNewQuantity) {
              setTimeout(() => {
                this.modalService.cancel();
              }, 25);
            }

            return of(null);
          }
          this.position.item = result.data;

          return this.itemService.get$(result.data.id).pipe(
            concatMap((existingItem) => {
              if (existingItem) {
                return this.itemService.update$(result.data);
              }

              return this.itemService.add$(result.data);
            })
          );
        })
      )
      .subscribe();
  }

  isUnitOfMeasureValid(): boolean {
    return this.position.item.units.some((x) => x.id === this.unit);
  }

  getHelperNote$(): Observable<string> {
    if (!this.quantity) return of('-');
    if (!this.isUnitOfMeasureValid()) return of('-');

    return this.translationService
      .translate$('pages.modals.food-quantity.content.IS')
      .pipe(
        map((is) => {
          const quantity = this.unitOfMeasureUtils.convertToBaseUnitOfMeasure(
            { value: this.quantity, unit: this.unit },
            this.position.item.units
          );

          return `${this.quantity} ${this.unit} ${is} ${quantity.value} ${quantity.unit}`;
        })
      );
  }

  getNutritionFacts(): NutritionFacts {
    return this.itemPositionService.getTotal([
      {
        ...this.position,
        quantity: {
          value: this.quantity,
          unit: this.isUnitOfMeasureValid()
            ? this.unit
            : this.position.item.units.find((x) => x.isBase)?.id!,
        },
      },
    ]);
  }
}
