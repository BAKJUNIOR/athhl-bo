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
import { ProjectApi } from '../../../infrastructure/api/project.api';
import { ServiceApi } from '../../../../services/infrastructure/api/service.api';
import { Project, projectStatusLabel } from '../../../domain/entities/project.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';
import { paginate } from '../../../../../core/pagination/pagination';
import { TablePaginationComponent } from '../../../../../shared/ui/table-pagination/table-pagination.component';

type ConfirmType = 'publish' | 'unpublish' | 'delete';

interface ConfirmState {
  type: ConfirmType;
  project: Project;
  title: string;
  description: string;
  confirmLabel: string;
  danger: boolean;
}

@Component({
  selector: 'app-projects-list',
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
    TablePaginationComponent,
  ],
  templateUrl: './projects-list.component.html',
})
export class ProjectsListComponent {
  private readonly router = inject(Router);
  private readonly projectApi = inject(ProjectApi);
  private readonly serviceApi = inject(ServiceApi);
  private readonly toast = inject(ToastService);

  projects = signal<Project[]>([]);
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

  filteredProjects = computed(() => {
    const q = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    return this.projects().filter((p) => {
      const matchesQuery = !q || p.titleFr.toLowerCase().includes(q);
      const matchesStatus = !status || p.status === status;
      return matchesQuery && matchesStatus;
    });
  });
  readonly pager = paginate(this.filteredProjects);

  statusLabel = projectStatusLabel;

  // Libellé du métier par slug, pour la colonne "Métier" (la liste des projets ne renvoie que le slug).
  private readonly serviceLabels = signal<Record<string, string>>({});
  serviceLabel(slug: string): string {
    return this.serviceLabels()[slug] ?? slug;
  }

  openMenuId = signal<number | null>(null);

  // ── Confirmation (publier / dépublier / supprimer) ──
  confirm = signal<ConfirmState | null>(null);
  confirming = signal(false);

  constructor() {
    this.loadProjects();
    this.loadServices();
  }

  private loadServices(): void {
    // En cas d'échec, la colonne affiche simplement le slug du métier.
    this.serviceApi.list().subscribe({
      next: (services) => this.serviceLabels.set(Object.fromEntries(services.map((s) => [s.slug, s.titleFr]))),
    });
  }

  loadProjects(): void {
    this.loading.set(true);
    this.error.set(null);
    this.projectApi.list().subscribe({
      next: (list) => {
        this.projects.set(list ?? []);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(extractApiErrorMessage(err, 'Erreur lors du chargement des projets.'));
        this.loading.set(false);
      },
    });
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

  openCreate(): void {
    this.router.navigateByUrl('/projects/new');
  }

  openEdit(project: Project): void {
    this.closeMenu();
    this.router.navigateByUrl(`/projects/${project.id}/edit`);
  }

  askPublish(p: Project): void {
    this.closeMenu();
    this.confirm.set({
      type: 'publish', project: p,
      title: 'Publier ce projet ?',
      description: `« ${p.titleFr} » deviendra visible sur la page Projets du site.`,
      confirmLabel: 'Publier', danger: false,
    });
  }

  askUnpublish(p: Project): void {
    this.closeMenu();
    this.confirm.set({
      type: 'unpublish', project: p,
      title: 'Dépublier ce projet ?',
      description: `« ${p.titleFr} » ne sera plus visible sur le site.`,
      confirmLabel: 'Dépublier', danger: false,
    });
  }

  askDelete(p: Project): void {
    this.closeMenu();
    this.confirm.set({
      type: 'delete', project: p,
      title: 'Supprimer ce projet ?',
      description: `« ${p.titleFr} » sera définitivement supprimé.`,
      confirmLabel: 'Supprimer', danger: true,
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
      c.type === 'publish' ? this.projectApi.publish(c.project.id)
        : c.type === 'unpublish' ? this.projectApi.unpublish(c.project.id)
        : this.projectApi.delete(c.project.id);

    request$.subscribe({
      next: () => {
        this.confirming.set(false);
        this.confirm.set(null);
        this.toast.success(c.type === 'delete' ? 'Projet supprimé.' : c.type === 'publish' ? 'Projet publié.' : 'Projet dépublié.');
        this.loadProjects();
      },
      error: (err: HttpErrorResponse) => {
        this.confirming.set(false);
        this.toast.error(extractApiErrorMessage(err, "Erreur lors de l'opération."));
      },
    });
  }
}
