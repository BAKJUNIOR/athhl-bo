import { Component, inject, signal } from '@angular/core';
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
import { ServiceApi } from '../../../infrastructure/api/service.api';
import { CloudinaryUploadService } from '../../../../../core/services/cloudinary-upload.service';
import {
  ServicePrestation,
  ServiceProcessStep,
  ServiceUpsertRequest,
  emptyPrestation,
  emptyProcessStep,
  emptyServiceForm,
  serviceStatusLabel,
} from '../../../domain/entities/service.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';

@Component({
  selector: 'app-service-form',
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
  ],
  templateUrl: './service-form.component.html',
})
export class ServiceFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly serviceApi = inject(ServiceApi);
  private readonly cloudinary = inject(CloudinaryUploadService);
  private readonly toast = inject(ToastService);

  readonly serviceId = this.resolveId();
  readonly isEdit = this.serviceId !== null;

  loading = signal(this.isEdit);
  loadError = signal<string | null>(null);

  saving = signal(false);
  formError = signal<string | null>(null);
  submitAttempted = signal(false);
  uploadingField = signal<'image' | 'heroImage' | 'gallery' | null>(null);

  form = signal<ServiceUpsertRequest>(emptyServiceForm());
  // Généré par le backend à la création, affiché ici en lecture seule (voir service.entity.ts).
  currentSlug = signal<string | null>(null);

  statusLabel = serviceStatusLabel;

  constructor() {
    if (this.isEdit) {
      this.loadService();
    }
  }

  private resolveId(): number | null {
    const raw = this.route.snapshot.paramMap.get('id');
    if (!raw) return null;
    const id = Number(raw);
    return Number.isFinite(id) ? id : null;
  }

  private loadService(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.serviceApi.getById(this.serviceId!).subscribe({
      next: (service) => {
        const { id, updatedAt, slug, ...rest } = service;
        this.form.set(rest);
        this.currentSlug.set(slug);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loadError.set(
          extractApiErrorMessage(
            err,
            "Impossible de charger ce service : l'API backend correspondante n'existe pas encore."
          )
        );
        this.loading.set(false);
      },
    });
  }

  cancel(): void {
    if (this.saving()) return;
    this.router.navigateByUrl('/services');
  }

  updateForm<K extends keyof ServiceUpsertRequest>(field: K, value: ServiceUpsertRequest[K]): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  onStatusChange(published: boolean): void {
    this.updateForm('status', published ? 'published' : 'draft');
  }

  // Prestations
  addPrestation(): void {
    this.form.update((f) => ({ ...f, prestations: [...f.prestations, emptyPrestation()] }));
  }

  removePrestation(index: number): void {
    this.form.update((f) => ({ ...f, prestations: f.prestations.filter((_, i) => i !== index) }));
  }

  updatePrestation(index: number, field: keyof ServicePrestation, value: string): void {
    this.form.update((f) => ({
      ...f,
      prestations: f.prestations.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }));
  }

  // Étapes du processus
  addStep(): void {
    this.form.update((f) => ({ ...f, process: [...f.process, emptyProcessStep(f.process.length + 1)] }));
  }

  removeStep(index: number): void {
    this.form.update((f) => ({
      ...f,
      process: f.process
        .filter((_, i) => i !== index)
        .map((s, i) => ({ ...s, number: String(i + 1).padStart(2, '0') })),
    }));
  }

  updateStep(index: number, field: keyof Omit<ServiceProcessStep, 'number'>, value: string): void {
    this.form.update((f) => ({
      ...f,
      process: f.process.map((s, i) => (i === index ? { ...s, [field]: value } : s)),
    }));
  }

  // Galerie
  removeGalleryImage(index: number): void {
    this.form.update((f) => ({ ...f, gallery: f.gallery.filter((_, i) => i !== index) }));
  }

  // Upload d'images (Cloudinary)
  onImageSelected(event: Event, field: 'image' | 'heroImage'): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploadingField.set(field);
    this.cloudinary.upload(file, 'services').subscribe({
      next: (res) => {
        this.updateForm(field, res.secure_url);
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
    this.cloudinary.upload(file, 'services/gallery').subscribe({
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

  get leadFrMissing(): boolean {
    return this.submitAttempted() && !this.form().leadFr.trim();
  }

  submitForm(): void {
    this.submitAttempted.set(true);
    const f = this.form();
    if (!f.titleFr.trim() || !f.leadFr.trim()) {
      this.formError.set('Le titre (FR) et le texte de présentation (FR) sont obligatoires.');
      return;
    }
    this.formError.set(null);
    this.saving.set(true);

    const payload: ServiceUpsertRequest = { ...f };
    const id = this.serviceId;
    const request$ = id ? this.serviceApi.update(id, payload) : this.serviceApi.create(payload);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(id ? 'Service mis à jour.' : 'Service créé.');
        this.router.navigateByUrl('/services');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.formError.set(
          extractApiErrorMessage(
            err,
            "Erreur lors de l'enregistrement : l'API backend correspondante n'existe pas encore."
          )
        );
      },
    });
  }
}
