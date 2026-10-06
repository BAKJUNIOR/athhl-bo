// Pagination côté client des tableaux du BO (listes déjà chargées et filtrées dans le navigateur).
import { computed, linkedSignal, Signal, WritableSignal } from '@angular/core';

export const DEFAULT_PAGE_SIZE = 8;

export interface Pager<T> {
  /** Page courante, à partir de 1. */
  page: WritableSignal<number>;
  pageSize: number;
  pageCount: Signal<number>;
  total: Signal<number>;
  /** Lignes de la page courante, à afficher dans le @for du tableau. */
  items: Signal<T[]>;
}

/**
 * Découpe `source` (en général la liste filtrée d'un tableau) en pages de `pageSize` lignes.
 * Retour à la page 1 quand le nombre de lignes change (recherche, filtre, suppression) ; on reste
 * sur la même page quand seul le contenu change (publier/dépublier recharge la liste à l'identique).
 */
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
