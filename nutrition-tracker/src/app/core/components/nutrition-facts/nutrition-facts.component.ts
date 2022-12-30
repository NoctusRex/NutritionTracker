import { Component, EventEmitter, Input, OnInit, Output } from '@angular/core';
import { NutritionFacts } from '../../models/nutrition-facts.model';

@Component({
  templateUrl: './nutrition-facts.component.html',
  selector: 'app-nutrition-facts',
})
export class NutritionFactsComponent {
  @Input() nutritionFacts: NutritionFacts | null = {
    calories: undefined,
    protein: undefined,
    saturatedFat: undefined,
    sodium: undefined,
    sugar: undefined,
    totalCarbohydrate: undefined,
    totalFat: undefined,
  };
  @Input() enableInput: boolean = false;
  @Output() isValid = new EventEmitter<boolean>();

  isValueValid(
    value: number | undefined,
    compareValue: number | undefined = undefined,
    triggerEvent: boolean = true
  ): boolean {
    if (triggerEvent) {
      this.onValidationChanged();
    }

    return (
      value !== undefined &&
      value !== null &&
      value >= 0 &&
      (compareValue === undefined ||
        compareValue === null ||
        value <= compareValue)
    );
  }

  isCaloriesValid(triggerEvent: boolean = true): boolean {
    const valid = this.isValueValid(
      this.nutritionFacts?.calories,
      undefined,
      triggerEvent
    );
    const isZero = this.nutritionFacts?.calories! === 0;
    const isFatAndCarbohydratesZero =
      this.nutritionFacts?.totalFat! === 0 &&
      this.nutritionFacts?.totalCarbohydrate! === 0;

    return (
      valid &&
      ((isZero && isFatAndCarbohydratesZero) ||
        (!isZero && !isFatAndCarbohydratesZero))
    );
  }

  onValidationChanged(): void {
    const valid =
      this.isCaloriesValid(false) &&
      this.isValueValid(this.nutritionFacts?.protein, undefined, false) &&
      this.isValueValid(this.nutritionFacts?.totalFat, undefined, false) &&
      this.isValueValid(
        this.nutritionFacts?.saturatedFat,
        this.nutritionFacts?.totalFat,
        false
      ) &&
      this.isValueValid(this.nutritionFacts?.sodium, undefined, false) &&
      this.isValueValid(
        this.nutritionFacts?.totalCarbohydrate,
        undefined,
        false
      ) &&
      this.isValueValid(
        this.nutritionFacts?.sugar,
        this.nutritionFacts?.totalCarbohydrate,
        false
      );

    this.isValid.emit(valid);
  }
}
