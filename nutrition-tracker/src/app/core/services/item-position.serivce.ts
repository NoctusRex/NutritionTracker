import { Injectable } from '@angular/core';
import { ItemPosition } from '../models/item-position.model';
import { CollectionService } from './collection.service';
import { PouchDbService } from './pouch-db.service';

@Injectable({ providedIn: 'root' })
export class ItemPositionService extends CollectionService<ItemPosition> {
  constructor(pouchDbSerive: PouchDbService) {
    super('item-positions', pouchDbSerive);
  }
}
