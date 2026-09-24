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
import { ServiceApi } from '../../../infrastructure/api/service.api';
import { Service, serviceStatusLabel } from '../../../domain/entities/service.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';

type ConfirmType = 'publish' | 'unpublish' | 'delete';

interface ConfirmState {
  type: ConfirmType;
  service: Service;
  title: string;
  description: string;
  confirmLabel: string;
  danger: boolean;
}

@Component({
  selector: 'app-services-list',
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
  templateUrl: './services-list.component.html',
})
export class ServicesListComponent {
  private readonly serviceApi = inject(ServiceApi);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  services = signal<Service[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  search = signal('');
  statusFilter = signal<'' | 'draft' | 'published'>('');
  filtersOpen = signal(false);

  readonly statusFilterOptions: Option[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'published', label: 'Publié' },
    { value: 'draft', label: 'Brouillon' },
  ];

  filteredServices = computed(() => {
    const q = this.search().trim().toLowerCase();
    const status = this.statusFilter();

    return this.services().filter((s) => {
      const matchesQuery =
        !q || s.titleFr.toLowerCase().includes(q) || s.slug.toLowerCase().includes(q);
      const matchesStatus = !status || s.status === status;
      return matchesQuery && matchesStatus;
    });
  });

  stats = computed(() => {
    const list = this.services();
    return {
      total: list.length,
      published: list.filter((s) => s.status === 'published').length,
      draft: list.filter((s) => s.status === 'draft').length,
    };
  });

  statusLabel = serviceStatusLabel;

  // ── Menu ligne (⋮) ──
  openMenuId = signal<number | null>(null);

  // ── Confirmation (publier / dépublier / supprimer) ──
  confirm = signal<ConfirmState | null>(null);
  confirming = signal(false);

  constructor() {
    this.loadServices();
  }

  loadServices(): void {
    this.loading.set(true);
    this.error.set(null);
    this.serviceApi.list().subscribe({
      next: (list) => {
        this.services.set(list ?? []);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(extractApiErrorMessage(err, 'Erreur lors du chargement des services.'));
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
    this.router.navigateByUrl('/services/new');
  }

  openEdit(service: Service): void {
    this.closeMenu();
    this.router.navigateByUrl(`/services/${service.id}/edit`);
  }

  // ── Actions ligne ──
  askPublish(s: Service): void {
    this.closeMenu();
    this.confirm.set({
      type: 'publish',
      service: s,
      title: 'Publier ce service ?',
      description: `« ${s.titleFr} » deviendra visible sur le site vitrine.`,
      confirmLabel: 'Publier',
      danger: false,
    });
  }

  askUnpublish(s: Service): void {
    this.closeMenu();
    this.confirm.set({
      type: 'unpublish',
      service: s,
      title: 'Dépublier ce service ?',
      description: `« ${s.titleFr} » ne sera plus visible sur le site (les liens déjà partagés cesseront de fonctionner).`,
      confirmLabel: 'Dépublier',
      danger: false,
    });
  }

  askDelete(s: Service): void {
    this.closeMenu();
    this.confirm.set({
      type: 'delete',
      service: s,
      title: 'Supprimer ce service ?',
      description: `« ${s.titleFr} » sera définitivement supprimé. Cette action est irréversible.`,
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
      c.type === 'publish'
        ? this.serviceApi.publish(c.service.id)
        : c.type === 'unpublish'
          ? this.serviceApi.unpublish(c.service.id)
          : this.serviceApi.delete(c.service.id);

    request$.subscribe({
      next: () => {
        this.confirming.set(false);
        this.confirm.set(null);
        this.toast.success(
          c.type === 'delete' ? 'Service supprimé.' : c.type === 'publish' ? 'Service publié.' : 'Service dépublié.'
        );
        this.loadServices();
      },
      error: (err: HttpErrorResponse) => {
        this.confirming.set(false);
        this.toast.error(extractApiErrorMessage(err, "Erreur lors de l'opération."));
      },
    });
  }
}
