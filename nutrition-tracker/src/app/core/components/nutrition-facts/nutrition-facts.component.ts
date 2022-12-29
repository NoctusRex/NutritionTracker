import { Component, Input } from '@angular/core';
import { NutritionFacts } from '../../models/nutrition-facts.model';

@Component({
  templateUrl: './nutrition-facts.component.html',
  selector: 'app-nutrition-facts',
})
export class NutritionFactsComponent {
  @Input() nutritionFacts!: NutritionFacts | null;
}
