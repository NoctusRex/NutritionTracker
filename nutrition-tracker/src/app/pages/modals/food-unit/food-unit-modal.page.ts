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
    private modalService: ModalService
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
}
