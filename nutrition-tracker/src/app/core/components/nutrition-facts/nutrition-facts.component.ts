import { Component, Input } from '@angular/core';
import { NutritionFacts } from '../../models/nutrition-facts.model';

@Component({
  templateUrl: './nutrition-facts.component.html',
  selector: 'app-nutrition-facts',
})
export class NutritionFactsComponent {
  @Input() nutritionFacts: NutritionFacts = {
    calories: 0,
    protein: 0,
    saturatedFat: 0,
    sodium: 0,
    sugar: 0,
    totalCarbohydrate: 0,
    totalFat: 0,
  };
}
