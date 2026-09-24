import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../../../dashboard/presentation/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../../dashboard/presentation/components/common/component-card/component-card.component';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ModalComponent } from '../../../../../shared/ui/modal/modal.component';
import { DropdownComponent } from '../../../../../shared/ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../../../../shared/ui/dropdown/dropdown-item/dropdown-item.component';
import { SelectComponent, Option } from '../../../../dashboard/presentation/components/form/select/select.component';
import { ApplicationApi } from '../../../infrastructure/api/application.api';
import { ApplicationStatus, JobApplication, applicationStatusLabel } from '../../../domain/entities/job-application.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';
import { fileNameOf, isImageUrl } from '../../../../../core/utils/file-preview.util';

@Component({
  selector: 'app-applications-list',
  standalone: true,
  imports: [
    CommonModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    BadgeComponent,
    ButtonComponent,
    ModalComponent,
    DropdownComponent,
    DropdownItemComponent,
    SelectComponent,
  ],
  templateUrl: './applications-list.component.html',
})
export class ApplicationsListComponent {
  private readonly applicationApi = inject(ApplicationApi);
  private readonly toast = inject(ToastService);

  applications = signal<JobApplication[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  search = signal('');
  statusFilter = signal<'' | ApplicationStatus>('');
  filtersOpen = signal(false);

  readonly statusFilterOptions: Option[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'new', label: 'Nouvelle' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'done', label: 'Traitée' },
  ];

  filteredApplications = computed(() => {
    const q = this.search().trim().toLowerCase();
    const status = this.statusFilter();

    return this.applications().filter((a) => {
      const matchesQuery =
        !q || a.name.toLowerCase().includes(q) || a.position.toLowerCase().includes(q) || a.phone.includes(q);
      const matchesStatus = !status || a.status === status;
      return matchesQuery && matchesStatus;
    });
  });

  stats = computed(() => {
    const list = this.applications();
    return {
      total: list.length,
      new: list.filter((a) => a.status === 'new').length,
      inProgress: list.filter((a) => a.status === 'in_progress').length,
      done: list.filter((a) => a.status === 'done').length,
    };
  });

  statusLabel = applicationStatusLabel;

  openMenuId = signal<number | null>(null);
  detail = signal<JobApplication | null>(null);
  deleteTarget = signal<JobApplication | null>(null);
  deleting = signal(false);

  constructor() {
    this.loadApplications();
  }

  loadApplications(): void {
    this.loading.set(true);
    this.error.set(null);
    this.applicationApi.list().subscribe({
      next: (list) => {
        this.applications.set(list ?? []);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(extractApiErrorMessage(err, 'Erreur lors du chargement des candidatures.'));
        this.loading.set(false);
      },
    });
  }

  isImageUrl = isImageUrl;
  fileNameOf = fileNameOf;

  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' });
    } catch {
      return iso;
    }
  }

  toggleFilters(): void {
    this.filtersOpen.update((v) => !v);
  }

  toggleMenu(id: number): void {
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  openDetail(a: JobApplication): void {
    this.closeMenu();
    this.detail.set(a);
  }

  closeDetail(): void {
    this.detail.set(null);
  }

  setStatus(a: JobApplication, status: ApplicationStatus): void {
    this.closeMenu();
    this.applicationApi.updateStatus(a.id, status).subscribe({
      next: () => {
        this.toast.success('Statut mis à jour.');
        this.loadApplications();
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err, 'Erreur lors de la mise à jour du statut.'));
      },
    });
  }

  askDelete(a: JobApplication): void {
    this.closeMenu();
    this.deleteTarget.set(a);
  }

  cancelDelete(): void {
    if (this.deleting()) return;
    this.deleteTarget.set(null);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.applicationApi.delete(target.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.toast.success('Candidature supprimée.');
        this.loadApplications();
      },
      error: (err: HttpErrorResponse) => {
        this.deleting.set(false);
        this.toast.error(extractApiErrorMessage(err, 'Erreur lors de la suppression.'));
      },
    });
  }
}
