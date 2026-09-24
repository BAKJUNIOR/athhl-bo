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
import { QuoteApi } from '../../../infrastructure/api/quote.api';
import { QuoteRequest, QuoteRequestStatus, quoteStatusLabel } from '../../../domain/entities/quote-request.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';
import { fileNameOf, isImageUrl } from '../../../../../core/utils/file-preview.util';

@Component({
  selector: 'app-quotes-list',
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
  templateUrl: './quotes-list.component.html',
})
export class QuotesListComponent {
  private readonly quoteApi = inject(QuoteApi);
  private readonly toast = inject(ToastService);

  quotes = signal<QuoteRequest[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  search = signal('');
  statusFilter = signal<'' | QuoteRequestStatus>('');
  filtersOpen = signal(false);

  readonly statusFilterOptions: Option[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'new', label: 'Nouvelle' },
    { value: 'in_progress', label: 'En cours' },
    { value: 'done', label: 'Traitée' },
  ];

  filteredQuotes = computed(() => {
    const q = this.search().trim().toLowerCase();
    const status = this.statusFilter();

    return this.quotes().filter((r) => {
      const matchesQuery =
        !q || r.name.toLowerCase().includes(q) || r.serviceLabel.toLowerCase().includes(q) || r.phone.includes(q);
      const matchesStatus = !status || r.status === status;
      return matchesQuery && matchesStatus;
    });
  });

  stats = computed(() => {
    const list = this.quotes();
    return {
      total: list.length,
      new: list.filter((r) => r.status === 'new').length,
      inProgress: list.filter((r) => r.status === 'in_progress').length,
      done: list.filter((r) => r.status === 'done').length,
    };
  });

  statusLabel = quoteStatusLabel;

  openMenuId = signal<number | null>(null);
  detail = signal<QuoteRequest | null>(null);
  deleteTarget = signal<QuoteRequest | null>(null);
  deleting = signal(false);

  constructor() {
    this.loadQuotes();
  }

  loadQuotes(): void {
    this.loading.set(true);
    this.error.set(null);
    this.quoteApi.list().subscribe({
      next: (list) => {
        this.quotes.set(list ?? []);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(extractApiErrorMessage(err, 'Erreur lors du chargement des demandes.'));
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

  openDetail(r: QuoteRequest): void {
    this.closeMenu();
    this.detail.set(r);
  }

  closeDetail(): void {
    this.detail.set(null);
  }

  setStatus(r: QuoteRequest, status: QuoteRequestStatus): void {
    this.closeMenu();
    this.quoteApi.updateStatus(r.id, status).subscribe({
      next: () => {
        this.toast.success('Statut mis à jour.');
        this.loadQuotes();
      },
      error: (err: HttpErrorResponse) => {
        this.toast.error(extractApiErrorMessage(err, 'Erreur lors de la mise à jour du statut.'));
      },
    });
  }

  askDelete(r: QuoteRequest): void {
    this.closeMenu();
    this.deleteTarget.set(r);
  }

  cancelDelete(): void {
    if (this.deleting()) return;
    this.deleteTarget.set(null);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.quoteApi.delete(target.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.toast.success('Demande supprimée.');
        this.loadQuotes();
      },
      error: (err: HttpErrorResponse) => {
        this.deleting.set(false);
        this.toast.error(extractApiErrorMessage(err, 'Erreur lors de la suppression.'));
      },
    });
  }
}
