import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { PageBreadcrumbComponent } from '../../../../dashboard/presentation/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../../dashboard/presentation/components/common/component-card/component-card.component';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ModalComponent } from '../../../../../shared/ui/modal/modal.component';
import { DropdownComponent } from '../../../../../shared/ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../../../../shared/ui/dropdown/dropdown-item/dropdown-item.component';
import { LabelComponent } from '../../../../dashboard/presentation/components/form/label/label.component';
import { InputFieldComponent } from '../../../../dashboard/presentation/components/form/input/input-field.component';
import { SwitchComponent } from '../../../../dashboard/presentation/components/form/input/switch.component';
import { SelectComponent, Option } from '../../../../dashboard/presentation/components/form/select/select.component';
import { ProjectApi } from '../../../infrastructure/api/project.api';
import { CloudinaryUploadService } from '../../../../../core/services/cloudinary-upload.service';
import { Project, ProjectUpsertRequest, emptyProjectForm, projectStatusLabel } from '../../../domain/entities/project.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';

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
    PageBreadcrumbComponent,
    ComponentCardComponent,
    BadgeComponent,
    ButtonComponent,
    ModalComponent,
    DropdownComponent,
    DropdownItemComponent,
    LabelComponent,
    InputFieldComponent,
    SwitchComponent,
    SelectComponent,
  ],
  templateUrl: './projects-list.component.html',
})
export class ProjectsListComponent {
  private readonly projectApi = inject(ProjectApi);
  private readonly cloudinary = inject(CloudinaryUploadService);
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

  statusLabel = projectStatusLabel;

  openMenuId = signal<number | null>(null);

  // ── Modale création/édition ──
  formOpen = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);
  form = signal<ProjectUpsertRequest>(emptyProjectForm());
  submitAttempted = signal(false);
  uploadingImage = signal(false);

  // ── Confirmation (publier / dépublier / supprimer) ──
  confirm = signal<ConfirmState | null>(null);
  confirming = signal(false);

  constructor() {
    this.loadProjects();
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
    this.editingId.set(null);
    this.form.set(emptyProjectForm());
    this.submitAttempted.set(false);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  openEdit(project: Project): void {
    this.closeMenu();
    const { id, updatedAt, ...rest } = project;
    this.editingId.set(id);
    this.form.set({ ...rest });
    this.submitAttempted.set(false);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  closeForm(): void {
    if (this.saving()) return;
    this.formOpen.set(false);
  }

  updateForm<K extends keyof ProjectUpsertRequest>(field: K, value: ProjectUpsertRequest[K]): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  onStatusChange(published: boolean): void {
    this.updateForm('status', published ? 'published' : 'draft');
  }

  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploadingImage.set(true);
    this.cloudinary.upload(file, 'projects').subscribe({
      next: (res) => {
        this.updateForm('image', res.secure_url);
        this.uploadingImage.set(false);
      },
      error: (err: Error) => {
        this.uploadingImage.set(false);
        this.toast.error(err?.message || "Erreur lors de l'envoi de l'image.");
      },
    });
  }

  get titleFrMissing(): boolean {
    return this.submitAttempted() && !this.form().titleFr.trim();
  }

  submitForm(): void {
    this.submitAttempted.set(true);
    const f = this.form();
    if (!f.titleFr.trim()) {
      this.formError.set('Le titre (FR) est obligatoire.');
      return;
    }
    this.formError.set(null);
    this.saving.set(true);

    const id = this.editingId();
    const request$ = id ? this.projectApi.update(id, f) : this.projectApi.create(f);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.toast.success(id ? 'Projet mis à jour.' : 'Projet ajouté.');
        this.loadProjects();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.formError.set(
          extractApiErrorMessage(err, "Erreur lors de l'enregistrement : l'API backend correspondante n'existe pas encore.")
        );
      },
    });
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
