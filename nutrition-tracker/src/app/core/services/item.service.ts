import { Injectable } from '@angular/core';
import { Item } from '../models/item.model';
import { CollectionService } from './collection.service';
import { PouchDbService } from './pouch-db.service';

@Injectable({ providedIn: 'root' })
export class ItemService extends CollectionService<Item> {
  constructor(pouchDbSerive: PouchDbService) {
    super('items', pouchDbSerive);
  }
}
