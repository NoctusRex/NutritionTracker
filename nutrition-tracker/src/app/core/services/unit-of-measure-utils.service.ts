import { Injectable } from '@angular/core';
import { first } from 'lodash-es';
import { Quantity } from '../models/quantity.model';
import { UnitOfMeasure } from '../models/unit-of-measure.model';

@Injectable({ providedIn: 'root' })
export class UnitOfMeasureUtilsService {
  convertTo(
    quantity: Quantity,
    targetUnit: string,
    units: Array<UnitOfMeasure>
  ): Quantity {
    const sourceUnitOfMeasure = units.find((x) => x.id === quantity.unit);
    const targetUnitOfMeasure = units.find((x) => x.id === targetUnit);
    if (!sourceUnitOfMeasure) {
      throw new Error(
        `The unit ${quantity.unit} was not found in the units ${units.join(
          ','
        )}`
      );
    }
    if (!targetUnitOfMeasure) {
      throw new Error(
        `The unit ${targetUnit} was not found in the units ${units.join(',')}`
      );
    }

    const quantityInBase = quantity.value * sourceUnitOfMeasure.factor;
    const quantityInTarget = quantityInBase * targetUnitOfMeasure.factor;

    return {
      value: quantityInTarget,
      unit: targetUnitOfMeasure.id,
    } as Quantity;
  }

  convertToBaseUnitOfMeasure(
    quantity: Quantity,
    units: Array<UnitOfMeasure>
  ): Quantity {
    const baseUnitOfMeasure = units.find((x) => x.isBase);
    if (!baseUnitOfMeasure) {
      throw new Error('Could not find base unit.');
    }

    return this.convertTo(quantity, baseUnitOfMeasure.id, units);
  }
}
