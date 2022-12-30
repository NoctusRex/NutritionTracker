import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/core/components/base-component/base.component';
import { Location } from '@angular/common';
import { ItemPositionService } from 'src/app/core/services/item-position.serivce';
import { map, Observable } from 'rxjs';
import { ItemPosition } from 'src/app/core/models/item-position.model';
import { NutritionFacts } from 'src/app/core/models/nutrition-facts.model';
import { UnitOfMeasureUtilsService } from 'src/app/core/services/unit-of-measure-utils.service';
import { ModalService } from 'src/app/core/services/modal.service';
import { SelectFoodModalPageComponent } from 'src/app/pages/modals/select-food/select-food-modal.page';

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
    protected unitOfMeasureUtilsService: UnitOfMeasureUtilsService,
    private modalService: ModalService
  ) {
    super(router, location);
  }

  ngOnInit(): void {
    this.values$ = this.itemPositionService.values$;

    this.totalNutritionFacts$ = this.values$.pipe(
      map((values) => {
        return this.itemPositionService.getTotal(values);
      })
    );
  }

  addPosition(): void {
    // TODO: quantity page
    this.modalService
      .show$({ component: SelectFoodModalPageComponent })
      .subscribe();
  }

  openPosition(position: ItemPosition): void {}

  removePosition(position: ItemPosition): void {
    this.itemPositionService.remove$(position).subscribe();
  }
}
