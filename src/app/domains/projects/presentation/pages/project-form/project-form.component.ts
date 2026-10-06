import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../../dashboard/presentation/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../../dashboard/presentation/components/common/component-card/component-card.component';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { LabelComponent } from '../../../../dashboard/presentation/components/form/label/label.component';
import { InputFieldComponent } from '../../../../dashboard/presentation/components/form/input/input-field.component';
import { TextAreaComponent } from '../../../../dashboard/presentation/components/form/input/text-area.component';
import { SwitchComponent } from '../../../../dashboard/presentation/components/form/input/switch.component';
import { SelectComponent, Option } from '../../../../dashboard/presentation/components/form/select/select.component';
import { ProjectApi } from '../../../infrastructure/api/project.api';
import { ServiceApi } from '../../../../services/infrastructure/api/service.api';
import { CloudinaryUploadService } from '../../../../../core/services/cloudinary-upload.service';
import { ProjectUpsertRequest, emptyProjectForm, projectStatusLabel } from '../../../domain/entities/project.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';
import { SortableImagesComponent } from '../../../../../shared/ui/sortable-images/sortable-images.component';

@Component({
  selector: 'app-project-form',
  standalone: true,
  imports: [
    RouterModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    BadgeComponent,
    ButtonComponent,
    LabelComponent,
    InputFieldComponent,
    TextAreaComponent,
    SwitchComponent,
    SelectComponent,
    SortableImagesComponent,
  ],
  templateUrl: './project-form.component.html',
})
export class ProjectFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly projectApi = inject(ProjectApi);
  private readonly serviceApi = inject(ServiceApi);
  private readonly cloudinary = inject(CloudinaryUploadService);
  private readonly toast = inject(ToastService);

  readonly projectId = this.resolveId();
  readonly isEdit = this.projectId !== null;

  loading = signal(this.isEdit);
  loadError = signal<string | null>(null);

  saving = signal(false);
  formError = signal<string | null>(null);
  submitAttempted = signal(false);
  uploadingField = signal<'image' | 'gallery' | null>(null);

  form = signal<ProjectUpsertRequest>(emptyProjectForm());
  // Généré par le backend à la création, affiché ici en lecture seule (voir project.entity.ts).
  currentSlug = signal<string | null>(null);

  statusLabel = projectStatusLabel;
  readonly selectedServiceValue = computed(() => (this.form().serviceId ? String(this.form().serviceId) : ''));

  // ── Métiers (pour le sélecteur) ──
  serviceOptions = signal<Option[]>([]);
  servicesLoading = signal(true);

  constructor() {
    this.loadServices();
    if (this.isEdit) {
      this.loadProject();
    }
  }

  private resolveId(): number | null {
    const raw = this.route.snapshot.paramMap.get('id');
    if (!raw) return null;
    const id = Number(raw);
    return Number.isFinite(id) ? id : null;
  }

  private loadServices(): void {
    this.servicesLoading.set(true);
    this.serviceApi.list().subscribe({
      next: (services) => {
        this.serviceOptions.set(services.map((s) => ({ value: String(s.id), label: s.titleFr })));
        this.servicesLoading.set(false);
      },
      error: () => {
        this.servicesLoading.set(false);
      },
    });
  }

  private loadProject(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.projectApi.getById(this.projectId!).subscribe({
      next: (project) => {
        const { id, updatedAt, slug, serviceSlug, ...rest } = project;
        this.form.set(rest);
        this.currentSlug.set(slug);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loadError.set(extractApiErrorMessage(err, 'Impossible de charger ce projet.'));
        this.loading.set(false);
      },
    });
  }

  cancel(): void {
    if (this.saving()) return;
    this.router.navigateByUrl('/projects');
  }

  updateForm<K extends keyof ProjectUpsertRequest>(field: K, value: ProjectUpsertRequest[K]): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  onServiceChange(value: string): void {
    this.updateForm('serviceId', Number(value) || 0);
  }

  onStatusChange(published: boolean): void {
    this.updateForm('status', published ? 'published' : 'draft');
  }

  // Galerie
  removeGalleryImage(index: number): void {
    this.form.update((f) => ({ ...f, gallery: f.gallery.filter((_, i) => i !== index) }));
  }

  reorderGallery(images: string[]): void {
    this.updateForm('gallery', images);
  }

  // Upload d'images (Cloudinary)
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploadingField.set('image');
    this.cloudinary.upload(file, 'projects').subscribe({
      next: (res) => {
        this.updateForm('image', res.secure_url);
        this.uploadingField.set(null);
      },
      error: (err: Error) => {
        this.uploadingField.set(null);
        this.toast.error(err?.message || "Erreur lors de l'envoi de l'image.");
      },
    });
  }

  onGalleryImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploadingField.set('gallery');
    this.cloudinary.upload(file, 'projects/gallery').subscribe({
      next: (res) => {
        this.form.update((f) => ({ ...f, gallery: [...f.gallery, res.secure_url] }));
        this.uploadingField.set(null);
      },
      error: (err: Error) => {
        this.uploadingField.set(null);
        this.toast.error(err?.message || "Erreur lors de l'envoi de l'image.");
      },
    });
  }

  get titleFrMissing(): boolean {
    return this.submitAttempted() && !this.form().titleFr.trim();
  }

  get serviceMissing(): boolean {
    return this.submitAttempted() && !this.form().serviceId;
  }

  submitForm(): void {
    this.submitAttempted.set(true);
    const f = this.form();
    if (!f.titleFr.trim() || !f.serviceId) {
      this.formError.set('Le titre (FR) et le métier sont obligatoires.');
      return;
    }
    this.formError.set(null);
    this.saving.set(true);

    const id = this.projectId;
    const request$ = id ? this.projectApi.update(id, f) : this.projectApi.create(f);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(id ? 'Projet mis à jour.' : 'Projet créé.');
        this.router.navigateByUrl('/projects');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.formError.set(extractApiErrorMessage(err, "Erreur lors de l'enregistrement."));
      },
    });
  }
}
