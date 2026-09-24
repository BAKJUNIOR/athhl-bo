import { Injectable, signal } from '@angular/core';

export type ToastVariant = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: number;
  variant: ToastVariant;
  message: string;
}

@Injectable({ providedIn: 'root' })
export class ToastService {
  private nextId = 0;
  readonly toasts = signal<ToastMessage[]>([]);

  success(message: string): void { this.push('success', message); }
  error(message: string): void { this.push('error', message); }
  warning(message: string): void { this.push('warning', message); }
  info(message: string): void { this.push('info', message); }

  dismiss(id: number): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }

  private push(variant: ToastVariant, message: string): void {
    const id = this.nextId++;
    this.toasts.update((list) => [...list, { id, variant, message }]);
    setTimeout(() => this.dismiss(id), 5000);
  }
}
