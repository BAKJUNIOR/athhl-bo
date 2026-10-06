import { signal } from '@angular/core';
import { paginate } from './pagination';

describe('paginate', () => {
  const rows = (n: number) => Array.from({ length: n }, (_, i) => i + 1);

  it('découpe par pages de 8', () => {
    const pager = paginate(signal(rows(20)));
    expect(pager.pageCount()).toBe(3);
    expect(pager.items()).toEqual(rows(8));
    pager.page.set(3);
    expect(pager.items()).toEqual([17, 18, 19, 20]);
  });

  it('revient à la page 1 quand le nombre de lignes change (recherche, filtre)', () => {
    const source = signal(rows(20));
    const pager = paginate(source);
    pager.page.set(3);
    source.set(rows(12));
    expect(pager.page()).toBe(1);
    expect(pager.items()).toEqual(rows(8));
  });

  it('reste sur la même page quand seul le contenu change', () => {
    const source = signal(rows(20));
    const pager = paginate(source);
    pager.page.set(2);
    source.set(rows(20).map((n) => n * 10));
    expect(pager.page()).toBe(2);
    expect(pager.items()).toEqual([90, 100, 110, 120, 130, 140, 150, 160]);
  });

  it('liste vide : une seule page, aucune ligne', () => {
    const pager = paginate(signal<number[]>([]));
    expect(pager.pageCount()).toBe(1);
    expect(pager.items()).toEqual([]);
  });
});
