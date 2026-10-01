import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../../../dashboard/presentation/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../../dashboard/presentation/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ModalComponent } from '../../../../../shared/ui/modal/modal.component';
import { LabelComponent } from '../../../../dashboard/presentation/components/form/label/label.component';
import { InputFieldComponent } from '../../../../dashboard/presentation/components/form/input/input-field.component';
import { TextAreaComponent } from '../../../../dashboard/presentation/components/form/input/text-area.component';
import { TestimonialApi } from '../../../infrastructure/api/testimonial.api';
import { CloudinaryUploadService } from '../../../../../core/services/cloudinary-upload.service';
import { Testimonial, TestimonialUpsertRequest, emptyTestimonialForm } from '../../../domain/entities/testimonial.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';

@Component({
  selector: 'app-testimonial-list',
  standalone: true,
  imports: [
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    ModalComponent,
    LabelComponent,
    InputFieldComponent,
    TextAreaComponent,
  ],
  templateUrl: './testimonial-list.component.html',
})
export class TestimonialListComponent {
  private readonly testimonialApi = inject(TestimonialApi);
  private readonly cloudinary = inject(CloudinaryUploadService);
  private readonly toast = inject(ToastService);

  items = signal<Testimonial[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  sortedItems = computed(() => [...this.items()].sort((a, b) => a.sortOrder - b.sortOrder));

  // ── Modale création/édition ──
  formOpen = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);
  form = signal<TestimonialUpsertRequest>(emptyTestimonialForm(1));
  submitAttempted = signal(false);
  uploadingPhoto = signal(false);

  // ── Confirmation de suppression ──
  deleteTarget = signal<Testimonial | null>(null);
  deleting = signal(false);

  constructor() {
    this.loadItems();
  }

  loadItems(): void {
    this.loading.set(true);
    this.error.set(null);
    this.testimonialApi.list().subscribe({
      next: (list) => {
        this.items.set(list ?? []);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(extractApiErrorMessage(err, 'Erreur lors du chargement des témoignages.'));
        this.loading.set(false);
      },
    });
  }

  initials(name: string): string {
    const parts = name.trim().split(/\s+/);
    return `${parts[0]?.[0] ?? ''}${parts[1]?.[0] ?? ''}`.toUpperCase() || '?';
  }

  openCreate(): void {
    this.editingId.set(null);
    const nextOrder = this.items().length ? Math.max(...this.items().map((t) => t.sortOrder)) + 1 : 1;
    this.form.set(emptyTestimonialForm(nextOrder));
    this.submitAttempted.set(false);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  openEdit(item: Testimonial): void {
    const { id, updatedAt, ...rest } = item;
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

  updateForm<K extends keyof TestimonialUpsertRequest>(field: K, value: TestimonialUpsertRequest[K]): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploadingPhoto.set(true);
    this.cloudinary.upload(file, 'testimonials').subscribe({
      next: (res) => {
        this.updateForm('photo', res.secure_url);
        this.uploadingPhoto.set(false);
      },
      error: (err: Error) => {
        this.uploadingPhoto.set(false);
        this.toast.error(err?.message || "Erreur lors de l'envoi de la photo.");
      },
    });
  }

  get nameMissing(): boolean {
    return this.submitAttempted() && !this.form().name.trim();
  }

  get roleFrMissing(): boolean {
    return this.submitAttempted() && !this.form().roleFr.trim();
  }

  get textFrMissing(): boolean {
    return this.submitAttempted() && !this.form().textFr.trim();
  }

  submitForm(): void {
    this.submitAttempted.set(true);
    const f = this.form();
    if (!f.name.trim() || !f.roleFr.trim() || !f.textFr.trim()) {
      this.formError.set('Le nom, le rôle (FR) et le texte (FR) sont obligatoires.');
      return;
    }
    this.formError.set(null);
    this.saving.set(true);

    const id = this.editingId();
    const request$ = id ? this.testimonialApi.update(id, f) : this.testimonialApi.create(f);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.toast.success(id ? 'Témoignage mis à jour.' : 'Témoignage ajouté.');
        this.loadItems();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.formError.set(extractApiErrorMessage(err, "Erreur lors de l'enregistrement."));
      },
    });
  }

  askDelete(item: Testimonial): void {
    this.deleteTarget.set(item);
  }

  cancelDelete(): void {
    if (this.deleting()) return;
    this.deleteTarget.set(null);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.testimonialApi.delete(target.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.toast.success('Témoignage retiré.');
        this.loadItems();
      },
      error: (err: HttpErrorResponse) => {
        this.deleting.set(false);
        this.toast.error(extractApiErrorMessage(err, 'Erreur lors de la suppression.'));
      },
    });
  }
}
