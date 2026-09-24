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
import { JobApi } from '../../../infrastructure/api/job.api';
import { JobDomainApi } from '../../../infrastructure/api/job-domain.api';
import {
  JobDomainOption,
  JobOffer,
  deadlineStatus,
  jobStatusLabel,
} from '../../../domain/entities/job-offer.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';

type ConfirmType = 'publish' | 'unpublish' | 'delete';

interface ConfirmState {
  type: ConfirmType;
  job: JobOffer;
  title: string;
  description: string;
  confirmLabel: string;
  danger: boolean;
}

@Component({
  selector: 'app-jobs-list',
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
  templateUrl: './jobs-list.component.html',
})
export class JobsListComponent {
  private readonly jobApi = inject(JobApi);
  private readonly jobDomainApi = inject(JobDomainApi);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  jobs = signal<JobOffer[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  search = signal('');
  domainFilter = signal('');
  statusFilter = signal<'' | 'draft' | 'published'>('');
  filtersOpen = signal(false);
  // Nombre de filtres actifs à la fois — le badge sur le bouton "Filtrer" ne s'affiche
  // qu'à partir de 2 (un seul filtre actif se voit déjà à la couleur du bouton).
  readonly activeFilterCount = computed(() => [this.domainFilter(), this.statusFilter()].filter(Boolean).length);

  domains = signal<JobDomainOption[]>([]);
  readonly domainFilterOptions = computed((): Option[] => [
    { value: '', label: 'Tous les domaines' },
    ...this.domains().map((d) => ({ value: String(d.id), label: d.labelFr })),
  ]);

  readonly statusFilterOptions: Option[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'published', label: 'Publiée' },
    { value: 'draft', label: 'Brouillon' },
  ];

  filteredJobs = computed(() => {
    const q = this.search().trim().toLowerCase();
    const domain = this.domainFilter();
    const status = this.statusFilter();

    return this.jobs().filter((j) => {
      const matchesQuery = !q || j.titleFr.toLowerCase().includes(q);
      const matchesDomain = !domain || String(j.domain.id) === domain;
      const matchesStatus = !status || j.status === status;
      return matchesQuery && matchesDomain && matchesStatus;
    });
  });

  stats = computed(() => {
    const list = this.jobs();
    return {
      total: list.length,
      published: list.filter((j) => j.status === 'published').length,
      draft: list.filter((j) => j.status === 'draft').length,
      closingSoon: list.filter((j) => j.status === 'published' && deadlineStatus(j.deadline) === 'soon').length,
    };
  });

  statusLabel = jobStatusLabel;
  deadlineStatus = deadlineStatus;

  // ── Menu ligne (⋮) ──
  openMenuId = signal<number | null>(null);

  // ── Confirmation (publier / dépublier / supprimer) ──
  confirm = signal<ConfirmState | null>(null);
  confirming = signal(false);

  constructor() {
    this.loadJobs();
    this.jobDomainApi.list().subscribe({
      next: (list) => this.domains.set(list ?? []),
      error: () => this.domains.set([]),
    });
  }

  loadJobs(): void {
    this.loading.set(true);
    this.error.set(null);
    this.jobApi.list().subscribe({
      next: (list) => {
        this.jobs.set(list ?? []);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(extractApiErrorMessage(err, 'Erreur lors du chargement des offres.'));
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

  deadlineBadgeColor(job: JobOffer): 'success' | 'warning' | 'error' {
    const status = deadlineStatus(job.deadline);
    return status === 'open' ? 'success' : status === 'soon' ? 'warning' : 'error';
  }

  deadlineBadgeLabel(job: JobOffer): string {
    const status = deadlineStatus(job.deadline);
    return status === 'open' ? 'Ouverte' : status === 'soon' ? 'Clôture proche' : 'Clôturée';
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
    this.router.navigateByUrl('/jobs/new');
  }

  openEdit(job: JobOffer): void {
    this.closeMenu();
    this.router.navigateByUrl(`/jobs/${job.id}/edit`);
  }

  // ── Actions ligne ──
  askPublish(j: JobOffer): void {
    this.closeMenu();
    this.confirm.set({
      type: 'publish',
      job: j,
      title: 'Publier cette offre ?',
      description: `« ${j.titleFr} » deviendra visible sur la page Carrières du site.`,
      confirmLabel: 'Publier',
      danger: false,
    });
  }

  askUnpublish(j: JobOffer): void {
    this.closeMenu();
    this.confirm.set({
      type: 'unpublish',
      job: j,
      title: 'Dépublier cette offre ?',
      description: `« ${j.titleFr} » ne sera plus visible sur le site.`,
      confirmLabel: 'Dépublier',
      danger: false,
    });
  }

  askDelete(j: JobOffer): void {
    this.closeMenu();
    this.confirm.set({
      type: 'delete',
      job: j,
      title: 'Supprimer cette offre ?',
      description: `« ${j.titleFr} » sera définitivement supprimée. Cette action est irréversible.`,
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
        ? this.jobApi.publish(c.job.id)
        : c.type === 'unpublish'
          ? this.jobApi.unpublish(c.job.id)
          : this.jobApi.delete(c.job.id);

    request$.subscribe({
      next: () => {
        this.confirming.set(false);
        this.confirm.set(null);
        this.toast.success(
          c.type === 'delete' ? 'Offre supprimée.' : c.type === 'publish' ? 'Offre publiée.' : 'Offre dépubliée.'
        );
        this.loadJobs();
      },
      error: (err: HttpErrorResponse) => {
        this.confirming.set(false);
        this.toast.error(extractApiErrorMessage(err, "Erreur lors de l'opération."));
      },
    });
  }
}
