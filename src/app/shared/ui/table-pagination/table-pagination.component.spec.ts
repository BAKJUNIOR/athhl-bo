import { signal } from '@angular/core';
import { TestBed } from '@angular/core/testing';
import { paginate } from '../../../core/pagination/pagination';
import { TablePaginationComponent } from './table-pagination.component';

describe('TablePaginationComponent', () => {
  function render(count: number) {
    const fixture = TestBed.createComponent(TablePaginationComponent);
    const pager = paginate(signal(Array.from({ length: count }, (_, i) => i)));
    fixture.componentRef.setInput('pager', pager);
    fixture.detectChanges();
    return { fixture, pager, el: fixture.nativeElement as HTMLElement };
  }

  it('masquée quand tout tient sur une page', () => {
    expect(render(8).el.textContent?.trim()).toBe('');
  });

  it('affiche la plage et passe à la page suivante', () => {
    const { fixture, pager, el } = render(23);
    expect(el.textContent).toContain('1–8 sur 23');
    (el.querySelector('[aria-label="Page suivante"]') as HTMLButtonElement).click();
    fixture.detectChanges();
    expect(pager.page()).toBe(2);
    expect(el.textContent).toContain('9–16 sur 23');
  });

  it('abrège les numéros de page avec des points de suspension', () => {
    const { fixture, pager } = render(100);
    pager.page.set(7);
    fixture.detectChanges();
    expect(fixture.componentInstance.pages()).toEqual([1, null, 6, 7, 8, null, 13]);
  });
});
