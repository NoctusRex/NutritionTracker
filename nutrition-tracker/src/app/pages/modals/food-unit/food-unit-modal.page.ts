import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from 'src/app/core/components/base-component/base.component';
import { Location } from '@angular/common';
import { ModalService } from 'src/app/core/services/modal.service';
import { ItemService } from 'src/app/core/services/item.service';
import { concatMap, map, Observable, of } from 'rxjs';
import { Item } from 'src/app/core/models/item.model';
import { cloneDeep, isEmpty } from 'lodash-es';
import { UnitOfMeasure } from 'src/app/core/models/unit-of-measure.model';
import { Quantity } from 'src/app/core/models/quantity.model';
import { UnitOfMeasureUtilsService } from 'src/app/core/services/unit-of-measure-utils.service';
import { TranslationService } from 'src/app/core/services/translation.service';

@Component({
  selector: 'app-food-unit-modal-page',
  templateUrl: 'food-unit-modal.page.html',
})
export class FoodUnitModalPageComponent
  extends BaseComponent
  implements OnInit
{
  @Input() unitOfMeasure!: UnitOfMeasure;
  @Input() item!: Item;
  isNewUnitOfMeasure: boolean = false;

  constructor(
    router: Router,
    location: Location,
    private modalService: ModalService,
    private unitOfMeasureUtils: UnitOfMeasureUtilsService,
    private translationService: TranslationService
  ) {
    super(router, location);
  }

  ngOnInit(): void {
    if (this.unitOfMeasure) {
      this.isNewUnitOfMeasure = false;

      return;
    }

    this.isNewUnitOfMeasure = true;
    this.unitOfMeasure = {
      id: '',
      factor: 1,
      isBase: false,
    };
  }

  override goBack(): void {
    return this.modalService.cancel();
  }

  override submit(): void {
    this.modalService.dismiss(cloneDeep(this.unitOfMeasure));
  }

  canSubmit(): boolean {
    return this.isUnitValid() && this.isFactorValid();
  }

  isUnitValid(): boolean {
    if (!this.isNewUnitOfMeasure) return true;

    const existing = this.item.units.find(
      (x) => x.id === this.unitOfMeasure.id
    );

    return !isEmpty(this.unitOfMeasure.id) && !existing;
  }

  isFactorValid(): boolean {
    return this.unitOfMeasure.factor > 0;
  }

  getHelperNote$(): Observable<string> {
    return this.translationService
      .translate$('pages.modals.food-unit.content.IS')
      .pipe(
        map((is) => {
          const units = cloneDeep(this.item.units);
          units.push(cloneDeep(this.unitOfMeasure));
          const value = 100;
          const baseUnit = this.item.units.find((x) => x.isBase)?.id!;
          const quantity = this.unitOfMeasureUtils.convertTo(
            { unit: baseUnit, value: value },
            this.unitOfMeasure.id,
            units
          );

          return `${value} ${baseUnit} ${is} ${quantity.value} ${quantity.unit}`;
        })
      );
  }
}
