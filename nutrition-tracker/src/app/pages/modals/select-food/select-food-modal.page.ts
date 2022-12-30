import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { BaseComponent } from 'src/app/core/components/base-component/base.component';
import { Location } from '@angular/common';
import { ModalService } from 'src/app/core/services/modal.service';
import { ItemService } from 'src/app/core/services/item.service';
import { concatMap, Observable } from 'rxjs';
import { Item } from 'src/app/core/models/item.model';
import { FoodModalPageComponent } from '../food/food-modal.page';
import { cloneDeep } from 'lodash';

@Component({
  selector: 'app-select-food-modal-page',
  templateUrl: 'select-food-modal.page.html',
})
export class SelectFoodModalPageComponent
  extends BaseComponent
  implements OnInit
{
  filterText: string = '';
  items$!: Observable<Array<Item>>;

  constructor(
    router: Router,
    location: Location,
    private modalService: ModalService,
    private itemService: ItemService
  ) {
    super(router, location);
  }

  ngOnInit(): void {
    this.items$ = this.itemService.values$;
  }

  override goBack(): void {
    return this.modalService.cancel();
  }

  override submit(): void {
    this.modalService
      .show$<Item>({ component: FoodModalPageComponent })
      .pipe(concatMap((item) => this.itemService.add$(item)))
      .subscribe();
  }

  selectItem(item: Item): void {
    return this.modalService.dismiss(item);
  }

  removeItem(item: Item): void {
    this.itemService.remove$(item).subscribe();
  }

  editItem(item: Item): void {
    this.modalService
      .show$<Item>({
        component: FoodModalPageComponent,
        componentProps: { item: cloneDeep(item) },
      })
      .pipe(concatMap((item) => this.itemService.update$(item)))
      .subscribe();
  }
}
