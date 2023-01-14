import { Injectable } from '@angular/core';
import { ToastController, ToastOptions } from '@ionic/angular';
import { from } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ToastService {
  constructor(private toastController: ToastController) {}
  show(message: string, options?: ToastOptions): void {
    const opt: ToastOptions = {
      message,
      buttons: [{ icon: 'close' }],
      position: 'middle',
      duration: 5000,
      ...options,
    };

    from(this.toastController.create(opt)).subscribe((x) => x.present());
  }
}
