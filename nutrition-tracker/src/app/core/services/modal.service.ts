import { Injectable } from '@angular/core';
import { ModalController, ModalOptions } from '@ionic/angular';
import { concatMap, filter, from, map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalService {
  constructor(private modalController: ModalController) {}

  show$<T>(opts: ModalOptions): Observable<T> {
    console.log('ModalSerivce - show', opts);

    return from(this.modalController.create(opts)).pipe(
      concatMap((modal) => from(modal.present()).pipe(map(() => modal))),
      concatMap((modal) => from(modal.onWillDismiss())),
      filter((result) => result.role !== 'cancel'),
      map((result) => result.data as T)
    );
  }

  cancel(): void {
    this.cancel$().subscribe();
  }

  cancel$(): Observable<void> {
    return this.dismiss$(null, 'cancel');
  }

  dismiss$(data: any, role: string = 'submit'): Observable<void> {
    console.log('ModalSerivce - dismiss', { data, role });

    return from(this.modalController.dismiss(data, role)).pipe(
      map(() => {
        return;
      })
    );
  }

  dismiss(data: any, role: string = 'submit'): void {
    this.dismiss$(data, role).subscribe();
  }
}
