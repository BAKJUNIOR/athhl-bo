import { Component, computed, Input } from '@angular/core';
import { Pager } from '../../../core/pagination/pagination';

@Component({
  selector: 'app-table-pagination',
  template: `
    @if (pager.pageCount() > 1) {
      <div class="flex flex-col items-center justify-between gap-3 border-t border-gray-100 px-5 py-3 sm:flex-row dark:border-white/[0.05]">
        <span class="text-theme-sm text-gray-500 dark:text-gray-400">
          {{ from() }}–{{ to() }} sur {{ pager.total() }}
        </span>
        <div class="flex items-center gap-1">
          <button type="button" [class]="navClass" [disabled]="current() === 1" (click)="go(current() - 1)" aria-label="Page précédente">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="stroke-current"><path d="M15 18l-6-6 6-6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
          @for (p of pages(); track $index) {
            @if (p === null) {
              <span class="px-1 text-theme-sm text-gray-400">…</span>
            } @else {
              <button
                type="button"
                class="h-9 min-w-9 rounded-lg px-2 text-theme-sm font-medium transition"
                [class]="p === current()
                  ? 'bg-brand-500 text-white'
                  : 'text-gray-700 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-white/[0.05]'"
                [attr.aria-current]="p === current() ? 'page' : null"
                (click)="go(p)"
              >{{ p }}</button>
            }
          }
          <button type="button" [class]="navClass" [disabled]="current() === pager.pageCount()" (click)="go(current() + 1)" aria-label="Page suivante">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" class="stroke-current"><path d="M9 18l6-6-6-6" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>
          </button>
        </div>
      </div>
    }
  `,
})
export class TablePaginationComponent {
  @Input({ required: true }) pager!: Pager<unknown>;

  readonly navClass =
    'flex h-9 w-9 items-center justify-center rounded-lg border border-gray-300 text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-40 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-white/[0.05]';

  readonly current = computed(() => Math.min(Math.max(this.pager.page(), 1), this.pager.pageCount()));
  readonly from = computed(() => (this.current() - 1) * this.pager.pageSize + 1);
  readonly to = computed(() => Math.min(this.current() * this.pager.pageSize, this.pager.total()));

  /** Numéros affichés : 1 … (courante ±1) … dernière ; null = points de suspension. */
  readonly pages = computed((): (number | null)[] => {
    const count = this.pager.pageCount();
    const cur = this.current();
    const wanted = new Set([1, count, cur - 1, cur, cur + 1].filter((p) => p >= 1 && p <= count));
    const sorted = [...wanted].sort((a, b) => a - b);
    const out: (number | null)[] = [];
    sorted.forEach((p, i) => {
      if (i > 0 && p - sorted[i - 1] > 1) out.push(null);
      out.push(p);
    });
    return out;
  });

  go(page: number): void {
    this.pager.page.set(Math.min(Math.max(page, 1), this.pager.pageCount()));
  }
}
