import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { BaseComponent } from 'src/app/core/components/base-component/base.component';
import { Location } from '@angular/common';
import { ModalService } from 'src/app/core/services/modal.service';
import { ItemService } from 'src/app/core/services/item.service';
import { concatMap, map, Observable, of } from 'rxjs';
import { Item } from 'src/app/core/models/item.model';
import { clone, cloneDeep, isEmpty } from 'lodash-es';
import { UnitOfMeasure } from 'src/app/core/models/unit-of-measure.model';
import { FoodUnitModalPageComponent } from '../food-unit/food-unit-modal.page';

@Component({
  selector: 'app-food-modal-page',
  templateUrl: 'food-modal.page.html',
})
export class FoodModalPageComponent extends BaseComponent implements OnInit {
  @Input() item!: Item;
  isNewItem: boolean = false;
  areNutritionsValid: boolean = false;

  constructor(
    router: Router,
    location: Location,
    private modalService: ModalService,
    private itemService: ItemService
  ) {
    super(router, location);
  }

  ngOnInit(): void {
    if (this.item) {
      this.isNewItem = false;

      return;
    }

    this.isNewItem = true;
    this.item = {
      id: '',
      description: '',
      nutritionFacts: {},
      units: [{ id: 'g', factor: 1, isBase: true }],
    };
  }

  override goBack(): void {
    return this.modalService.cancel();
  }

  override submit(): void {
    this.modalService.dismiss(cloneDeep(this.item));
  }

  openUnit(unitOfMeasure: UnitOfMeasure | null = null): void {
    if (unitOfMeasure?.isBase) return;

    this.modalService
      .show$<UnitOfMeasure>({
        component: FoodUnitModalPageComponent,
        componentProps: {
          unitOfMeasure: cloneDeep(unitOfMeasure),
          item: this.item,
        },
      })
      .subscribe((result) => {
        if (result.role === 'delete') {
          this.item.units = this.item.units.filter(
            (x) => x.id !== result.data.id
          );
          return;
        }

        const existingUnit = this.item.units.find(
          (x) => x.id === result.data.id
        );
        if (existingUnit) {
          Object.assign(existingUnit, result.data);
        } else {
          this.item.units.push(result.data);
        }
      });
  }

  removeUnit(unit: UnitOfMeasure): void {
    this.item.units = this.item.units.filter((x) => x.id !== unit.id);
  }

  isValidChanged(event: any): void {
    this.areNutritionsValid = event;
  }

  canSubmit$(): Observable<boolean> {
    return this.isItemValid$().pipe(
      map((isItemValid) => isItemValid && this.areNutritionsValid)
    );
  }

  isItemValid$(): Observable<boolean> {
    if (!this.isNewItem) return of(true);
    if (isEmpty(this.item.id.trim())) return of(false);

    return this.itemService.get$(this.item.id.trim()).pipe(
      map((existingItem) => {
        return existingItem ? false : true;
      })
    );
  }

  deleteItem(): void {
    this.itemService
      .remove$(this.item)
      .subscribe(() => this.modalService.dismiss(null));
  }
}
