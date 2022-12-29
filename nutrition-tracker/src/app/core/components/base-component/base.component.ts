import { Params, Router } from '@angular/router';
import { Location } from '@angular/common';

export abstract class BaseComponent {
  constructor(protected router: Router, protected location: Location) {}

  protected navigate(
    url: string,
    queryParams?: Params,
    state?: { [key: string]: any }
  ): void {
    console.log('navigate to', url, queryParams, state);
    this.router.navigate([url], { queryParams, state });
  }

  goBack(): void {}
  submit(): void {}
}
