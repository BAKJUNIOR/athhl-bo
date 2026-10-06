import { TestBed } from '@angular/core/testing';
import { CdkDragDrop } from '@angular/cdk/drag-drop';
import { SortableImagesComponent } from './sortable-images.component';

describe('SortableImagesComponent', () => {
  function setup(images: string[]) {
    const fixture = TestBed.createComponent(SortableImagesComponent);
    fixture.componentRef.setInput('images', images);
    fixture.detectChanges();
    const emitted: string[][] = [];
    fixture.componentInstance.reorder.subscribe((list) => emitted.push(list));
    return { fixture, component: fixture.componentInstance, emitted };
  }

  it('affiche le numéro de position de chaque image', () => {
    const { fixture } = setup(['a.jpg', 'b.jpg', 'c.jpg']);
    const badges = Array.from(fixture.nativeElement.querySelectorAll('img + span') as NodeListOf<HTMLElement>).map((el) =>
      el.textContent?.trim(),
    );
    expect(badges).toEqual(['1', '2', '3']);
  });

  it('glisser-déposer : émet la liste dans le nouvel ordre sans modifier l’entrée', () => {
    const images = ['a.jpg', 'b.jpg', 'c.jpg'];
    const { component, emitted } = setup(images);
    component.onDrop({ previousIndex: 2, currentIndex: 0 } as CdkDragDrop<string[]>);
    expect(emitted).toEqual([['c.jpg', 'a.jpg', 'b.jpg']]);
    expect(images).toEqual(['a.jpg', 'b.jpg', 'c.jpg']);
  });

  it('flèches : déplace d’un cran et ignore les bords', () => {
    const { component, emitted } = setup(['a.jpg', 'b.jpg', 'c.jpg']);
    component.move(0, 1);
    component.move(0, -1);
    component.move(2, 1);
    expect(emitted).toEqual([['b.jpg', 'a.jpg', 'c.jpg']]);
  });

  it('dépôt à la même place : rien n’est émis', () => {
    const { component, emitted } = setup(['a.jpg', 'b.jpg']);
    component.onDrop({ previousIndex: 1, currentIndex: 1 } as CdkDragDrop<string[]>);
    expect(emitted).toEqual([]);
  });
});
