import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CdkDrag, CdkDragDrop, CdkDragPlaceholder, CdkDropList, moveItemInArray } from '@angular/cdk/drag-drop';

@Component({
  selector: 'app-sortable-images',
  imports: [CdkDropList, CdkDrag, CdkDragPlaceholder],
  template: `
    <div
      class="flex flex-wrap gap-3"
      cdkDropList
      cdkDropListOrientation="mixed"
      [cdkDropListData]="images"
      (cdkDropListDropped)="onDrop($event)"
    >
      @for (img of images; track img + $index; let i = $index; let first = $first; let last = $last) {
        <div
          cdkDrag
          class="sortable-tile group relative cursor-grab overflow-hidden rounded-lg border border-gray-200 bg-gray-100 active:cursor-grabbing dark:border-gray-700 dark:bg-gray-800"
          [class]="tileClass"
          [attr.title]="'Glisser pour changer l\\'ordre'"
        >
          <img [src]="img" [alt]="alt + ' ' + (i + 1)" class="pointer-events-none h-full w-full object-cover" draggable="false" />

          <span class="absolute left-1 top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-black/70 px-1.5 text-[11px] font-semibold text-white">
            {{ i + 1 }}
          </span>

          <button
            type="button"
            (click)="remove.emit(i)"
            class="absolute right-1 top-1 flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white opacity-0 transition-opacity group-hover:opacity-100"
            aria-label="Supprimer l'image"
          >
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="stroke-current"><path d="M18 6L6 18M6 6l12 12" stroke-width="2" stroke-linecap="round"/></svg>
          </button>

          <div class="absolute inset-x-1 bottom-1 flex justify-between opacity-0 transition-opacity group-hover:opacity-100">
            <button
              type="button"
              (click)="move(i, -1)"
              [disabled]="first"
              class="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white disabled:invisible"
              aria-label="Déplacer avant"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="stroke-current"><path d="M15 18l-6-6 6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
            <button
              type="button"
              (click)="move(i, 1)"
              [disabled]="last"
              class="flex h-6 w-6 items-center justify-center rounded-full bg-black/60 text-white disabled:invisible"
              aria-label="Déplacer après"
            >
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" class="stroke-current"><path d="M9 18l6-6-6-6" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>
            </button>
          </div>

          <div *cdkDragPlaceholder class="rounded-lg border-2 border-dashed border-brand-300 bg-brand-50 dark:border-brand-800 dark:bg-brand-500/10" [class]="tileClass"></div>
        </div>
      }
      <!-- Case "Ajouter" (ou autre) fournie par le parent, toujours en fin de liste et non déplaçable. -->
      <ng-content />
    </div>
    @if (images.length > 1) {
      <p class="mt-1.5 text-xs text-gray-400">Glissez les images (ou utilisez les flèches) pour changer l'ordre : la n°1 s'affiche en premier sur le site.</p>
    }
  `,
  styles: `
    .cdk-drag-preview { box-shadow: 0 12px 28px -8px rgba(0, 0, 0, 0.35); border-radius: 0.5rem; overflow: hidden; }
    .cdk-drag-animating, .cdk-drop-list-dragging .sortable-tile:not(.cdk-drag-placeholder) { transition: transform 200ms cubic-bezier(0, 0, 0.2, 1); }
  `,
})
export class SortableImagesComponent {
  @Input({ required: true }) images: string[] = [];
  /** Taille des vignettes (classes Tailwind), ex. "h-20 w-28". */
  @Input() tileClass = 'h-20 w-28';
  @Input() alt = 'Image';

  /** Nouvelle liste dans le nouvel ordre. */
  @Output() reorder = new EventEmitter<string[]>();
  @Output() remove = new EventEmitter<number>();

  onDrop(event: CdkDragDrop<string[]>): void {
    if (event.previousIndex === event.currentIndex) return;
    const next = [...this.images];
    moveItemInArray(next, event.previousIndex, event.currentIndex);
    this.reorder.emit(next);
  }

  move(index: number, delta: -1 | 1): void {
    const target = index + delta;
    if (target < 0 || target >= this.images.length) return;
    const next = [...this.images];
    moveItemInArray(next, index, target);
    this.reorder.emit(next);
  }
}
