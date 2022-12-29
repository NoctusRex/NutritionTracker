import { Item } from './item.model';
import { Quantity } from './quantity.model';

export interface ItemPosition {
  id: string;
  item: Item;
  quantity: Quantity;
  timeStampAdded: string;
}
