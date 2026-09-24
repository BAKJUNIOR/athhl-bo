import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../../dashboard/presentation/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../../dashboard/presentation/components/common/component-card/component-card.component';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ModalComponent } from '../../../../../shared/ui/modal/modal.component';
import { DropdownComponent } from '../../../../../shared/ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../../../../shared/ui/dropdown/dropdown-item/dropdown-item.component';
import { SelectComponent, Option } from '../../../../dashboard/presentation/components/form/select/select.component';
import { PopupApi } from '../../../infrastructure/api/popup.api';
import { Popup, POPUP_PAGE_OPTIONS, popupPageLabel, popupTypeLabel } from '../../../domain/entities/popup.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';

type ConfirmType = 'activate' | 'deactivate' | 'delete';

interface ConfirmState {
  type: ConfirmType;
  popup: Popup;
  title: string;
  description: string;
  confirmLabel: string;
  danger: boolean;
}

@Component({
  selector: 'app-popups-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    BadgeComponent,
    ButtonComponent,
    ModalComponent,
    DropdownComponent,
    DropdownItemComponent,
    SelectComponent,
  ],
  templateUrl: './popups-list.component.html',
})
export class PopupsListComponent {
  private readonly popupApi = inject(PopupApi);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  popups = signal<Popup[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  search = signal('');
  pageFilter = signal('');
  statusFilter = signal<'' | 'active' | 'inactive'>('');
  filtersOpen = signal(false);

  readonly pageFilterOptions: Option[] = [
    { value: '', label: 'Toutes les pages' },
    ...POPUP_PAGE_OPTIONS.map((p) => ({ value: p.value || '__home__', label: p.label })),
  ];

  readonly statusFilterOptions: Option[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'active', label: 'Active' },
    { value: 'inactive', label: 'Inactive' },
  ];

  readonly activeFilterCount = computed(() => {
    let n = 0;
    if (this.pageFilter()) n++;
    if (this.statusFilter()) n++;
    return n;
  });

  filteredPopups = computed(() => {
    const q = this.search().trim().toLowerCase();
    const page = this.pageFilter();
    const status = this.statusFilter();

    return this.popups().filter((p) => {
      const matchesQuery = !q || p.title.toLowerCase().includes(q);
      const matchesPage = !page || (page === '__home__' ? p.page === '' : p.page === page);
      const matchesStatus = !status || (status === 'active' ? p.active : !p.active);
      return matchesQuery && matchesPage && matchesStatus;
    });
  });

  stats = computed(() => {
    const list = this.popups();
    return {
      total: list.length,
      active: list.filter((p) => p.active).length,
      inactive: list.filter((p) => !p.active).length,
    };
  });

  pageLabel = popupPageLabel;
  typeLabel = popupTypeLabel;

  // ── Menu ligne (⋮) ──
  openMenuId = signal<number | null>(null);

  // ── Confirmation (activer / désactiver / supprimer) ──
  confirm = signal<ConfirmState | null>(null);
  confirming = signal(false);

  constructor() {
    this.loadPopups();
  }

  loadPopups(): void {
    this.loading.set(true);
    this.error.set(null);
    this.popupApi.list().subscribe({
      next: (list) => {
        this.popups.set(list ?? []);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(extractApiErrorMessage(err, 'Erreur lors du chargement des popups.'));
        this.loading.set(false);
      },
    });
  }

  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  }

  toggleMenu(id: number): void {
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  toggleFilters(): void {
    this.filtersOpen.update((v) => !v);
  }

  openCreate(): void {
    this.router.navigateByUrl('/popups/new');
  }

  openEdit(popup: Popup): void {
    this.closeMenu();
    this.router.navigateByUrl(`/popups/${popup.id}/edit`);
  }

  // ── Actions ligne ──
  askActivate(p: Popup): void {
    this.closeMenu();
    this.confirm.set({
      type: 'activate',
      popup: p,
      title: 'Activer cette popup ?',
      description: `« ${p.title} » s'affichera sur la page « ${this.pageLabel(p.page)} ». Si une autre popup y est déjà active, elle sera automatiquement désactivée.`,
      confirmLabel: 'Activer',
      danger: false,
    });
  }

  askDeactivate(p: Popup): void {
    this.closeMenu();
    this.confirm.set({
      type: 'deactivate',
      popup: p,
      title: 'Désactiver cette popup ?',
      description: `« ${p.title} » ne s'affichera plus sur le site, sans être supprimée.`,
      confirmLabel: 'Désactiver',
      danger: false,
    });
  }

  askDelete(p: Popup): void {
    this.closeMenu();
    this.confirm.set({
      type: 'delete',
      popup: p,
      title: 'Supprimer cette popup ?',
      description: `« ${p.title} » sera définitivement supprimée. Cette action est irréversible.`,
      confirmLabel: 'Supprimer',
      danger: true,
    });
  }

  cancelConfirm(): void {
    if (this.confirming()) return;
    this.confirm.set(null);
  }

  runConfirm(): void {
    const c = this.confirm();
    if (!c) return;
    this.confirming.set(true);

    const request$: Observable<unknown> =
      c.type === 'activate'
        ? this.popupApi.activate(c.popup.id)
        : c.type === 'deactivate'
          ? this.popupApi.deactivate(c.popup.id)
          : this.popupApi.delete(c.popup.id);

    request$.subscribe({
      next: () => {
        this.confirming.set(false);
        this.confirm.set(null);
        this.toast.success(
          c.type === 'delete' ? 'Popup supprimée.' : c.type === 'activate' ? 'Popup activée.' : 'Popup désactivée.'
        );
        this.loadPopups();
      },
      error: (err: HttpErrorResponse) => {
        this.confirming.set(false);
        this.toast.error(extractApiErrorMessage(err, "Erreur lors de l'opération."));
      },
    });
  }
}
