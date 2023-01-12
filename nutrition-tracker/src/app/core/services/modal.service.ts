import { Injectable } from '@angular/core';
import { ModalController, ModalOptions } from '@ionic/angular';
import { concatMap, filter, from, map, Observable } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ModalService {
  constructor(private modalController: ModalController) {}

  show$<T>(opts: ModalOptions): Observable<{ data: T; role?: string }> {
    console.log('ModalSerivce - show', opts);
    opts.animated = false;

    return from(this.modalController.create(opts)).pipe(
      concatMap((modal) => from(modal.present()).pipe(map(() => modal))),
      concatMap((modal) => from(modal.onWillDismiss())),
      filter((result) => {
        return result.role !== 'cancel' && result.role !== 'backdrop';
      }),
      map((result) => {
        return { data: result.data as T, role: result.role };
      })
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
      map((x) => {
        return;
      })
    );
  }

  dismiss(data: any, role: string = 'submit'): void {
    this.dismiss$(data, role).subscribe();
  }
}
