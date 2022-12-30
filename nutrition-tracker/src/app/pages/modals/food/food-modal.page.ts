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
      id: 'New Food',
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

  openUnit(unit: UnitOfMeasure | null = null): void {
    if (unit?.isBase) return;
    // TODO
  }

  removeUnit(unit: UnitOfMeasure): void {}

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
}
