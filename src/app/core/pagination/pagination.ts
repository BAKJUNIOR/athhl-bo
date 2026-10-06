import { computed, linkedSignal, Signal, WritableSignal } from '@angular/core';

export const DEFAULT_PAGE_SIZE = 8;

export interface Pager<T> {
  page: WritableSignal<number>;
  pageSize: number;
  pageCount: Signal<number>;
  total: Signal<number>;
  items: Signal<T[]>;
}


export function paginate<T>(source: Signal<T[]>, pageSize = DEFAULT_PAGE_SIZE): Pager<T> {
  const total = computed(() => source().length);
  const pageCount = computed(() => Math.max(1, Math.ceil(total() / pageSize)));
  const page = linkedSignal<number, number>({
    source: total,
    computation: (count, previous) => (previous && previous.source === count ? previous.value : 1),
  });
  const items = computed(() => {
    const current = Math.min(Math.max(page(), 1), pageCount());
    return source().slice((current - 1) * pageSize, current * pageSize);
  });
  return { page, pageSize, pageCount, total, items };
}
