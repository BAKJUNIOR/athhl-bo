import { CommonModule } from '@angular/common';
import {
  Component,
  Input,
  Output,
  EventEmitter,
  ElementRef,
  ViewChild,
  AfterViewInit,
  OnDestroy,
  OnChanges,
  SimpleChanges,
  ChangeDetectorRef,
  inject,
} from '@angular/core';

@Component({
  selector: 'app-dropdown',
  templateUrl: './dropdown.component.html',
  imports:[CommonModule]
})
export class DropdownComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() isOpen = false;
  @Output() close = new EventEmitter<void>();
  @Input() className = '';
  // Quand true, le menu est positionné en `fixed` (calculé en JS depuis la position du
  // bouton déclencheur) au lieu d'`absolute` dans le flux normal : ça permet d'échapper
  // au clipping d'un ancêtre `overflow-x-auto`/`overflow-hidden` (ex: tableau scrollable),
  // où un menu absolute resterait coincé sous la barre de défilement.
  @Input() fixedPosition = false;

  @ViewChild('dropdownRef') dropdownRef!: ElementRef<HTMLDivElement>;

  fixedStyle: { top: string; left: string } | null = null;

  private readonly elementRef = inject(ElementRef<HTMLElement>);
  private readonly cdr = inject(ChangeDetectorRef);

  private handleClickOutside = (event: MouseEvent) => {
    if (
      this.isOpen &&
      this.dropdownRef &&
      this.dropdownRef.nativeElement &&
      !this.dropdownRef.nativeElement.contains(event.target as Node) &&
      !(event.target as HTMLElement).closest('.dropdown-toggle')
    ) {
      this.close.emit();
    }
  };

  // Repositionner en continu serait fragile ; on ferme simplement le menu si la page
  // défile ou est redimensionnée pendant qu'il est ouvert en mode `fixedPosition`.
  private handleReposition = () => {
    if (this.isOpen && this.fixedPosition) {
      this.close.emit();
    }
  };

  ngOnChanges(changes: SimpleChanges) {
    if (changes['isOpen']) {
      if (this.isOpen && this.fixedPosition) {
        setTimeout(() => this.computeFixedPosition());
      } else if (!this.isOpen) {
        this.fixedStyle = null;
      }
    }
  }

  ngAfterViewInit() {
    document.addEventListener('mousedown', this.handleClickOutside);
    window.addEventListener('scroll', this.handleReposition, true);
    window.addEventListener('resize', this.handleReposition);
  }

  ngOnDestroy() {
    document.removeEventListener('mousedown', this.handleClickOutside);
    window.removeEventListener('scroll', this.handleReposition, true);
    window.removeEventListener('resize', this.handleReposition);
  }

  private computeFixedPosition() {
    const toggle = this.elementRef.nativeElement.parentElement;
    const menu = this.dropdownRef?.nativeElement;
    if (!toggle || !menu) return;

    const toggleRect = toggle.getBoundingClientRect();
    const menuRect = menu.getBoundingClientRect();
    const gap = 8;

    // Toujours affiché sous le bouton déclencheur (jamais au-dessus), quitte à
    // déborder en bas de l'écran sur un petit viewport.
    const top = toggleRect.bottom + gap;

    let left = toggleRect.right - menuRect.width;
    if (left < 8) left = 8;

    this.fixedStyle = { top: `${top}px`, left: `${left}px` };
    this.cdr.detectChanges();
  }
}
