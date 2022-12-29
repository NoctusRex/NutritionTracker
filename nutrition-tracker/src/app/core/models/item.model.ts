import { NutritionFacts } from './nutrition-facts.model';
import { UnitOfMeasure } from './unit-of-measure.model';

export interface Item {
  id: string;
  description: string;
  units: Array<UnitOfMeasure>;
  nutritionFacts: NutritionFacts;
}
