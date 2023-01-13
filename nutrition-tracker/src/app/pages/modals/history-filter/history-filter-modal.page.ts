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
import moment from 'moment';

@Component({
  selector: 'app-history-filter-modal-page',
  templateUrl: 'history-filter-modal.page.html',
})
export class HistoryFilterModalPageComponent extends BaseComponent {
  @Input() min!: string;
  @Input() max!: string;

  constructor(
    router: Router,
    location: Location,
    private modalService: ModalService
  ) {
    super(router, location);
  }

  override goBack(): void {
    return this.modalService.cancel();
  }

  override submit(): void {
    this.modalService.dismiss({
      min: this.min,
      max: this.max,
    });
  }

  canSubmit(): boolean {
    return moment(this.min).isValid() && moment(this.max).isValid();
  }
}
