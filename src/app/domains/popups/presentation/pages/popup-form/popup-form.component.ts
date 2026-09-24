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
import { SelectComponent, Option } from '../../../../dashboard/presentation/components/form/select/select.component';
import { PopupApi } from '../../../infrastructure/api/popup.api';
import { CloudinaryUploadService } from '../../../../../core/services/cloudinary-upload.service';
import {
  PopupUpsertRequest,
  POPUP_PAGE_OPTIONS,
  emptyPopupForm,
  popupTypeLabel,
  popupLayoutLabel,
  popupFrequencyLabel,
} from '../../../domain/entities/popup.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';

@Component({
  selector: 'app-popup-form',
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
  ],
  templateUrl: './popup-form.component.html',
})
export class PopupFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly popupApi = inject(PopupApi);
  private readonly cloudinary = inject(CloudinaryUploadService);
  private readonly toast = inject(ToastService);

  readonly popupId = this.resolveId();
  readonly isEdit = this.popupId !== null;

  loading = signal(this.isEdit);
  loadError = signal<string | null>(null);

  saving = signal(false);
  formError = signal<string | null>(null);
  submitAttempted = signal(false);
  uploadingField = signal<'image' | 'video' | null>(null);

  form = signal<PopupUpsertRequest>(emptyPopupForm());

  readonly pageOptions: Option[] = POPUP_PAGE_OPTIONS.map((p) => ({ value: p.value || '__home__', label: p.label }));
  readonly typeOptions: Option[] = [
    { value: 'image', label: popupTypeLabel('image') },
    { value: 'image_text', label: popupTypeLabel('image_text') },
    { value: 'video', label: popupTypeLabel('video') },
  ];
  readonly layoutOptions: Option[] = [
    { value: 'stacked', label: popupLayoutLabel('stacked') },
    { value: 'image_left', label: popupLayoutLabel('image_left') },
  ];
  readonly frequencyOptions: Option[] = [
    { value: 'once_per_visitor', label: popupFrequencyLabel('once_per_visitor') },
    { value: 'every_visit', label: popupFrequencyLabel('every_visit') },
  ];

  constructor() {
    if (this.isEdit) {
      this.loadPopup();
    }
  }

  private resolveId(): number | null {
    const raw = this.route.snapshot.paramMap.get('id');
    if (!raw) return null;
    const id = Number(raw);
    return Number.isFinite(id) ? id : null;
  }

  private loadPopup(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.popupApi.getById(this.popupId!).subscribe({
      next: (popup) => {
        const { id, updatedAt, ...rest } = popup;
        this.form.set(rest);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loadError.set(
          extractApiErrorMessage(err, "Impossible de charger cette popup : l'API backend correspondante n'existe pas encore.")
        );
        this.loading.set(false);
      },
    });
  }

  cancel(): void {
    if (this.saving()) return;
    this.router.navigateByUrl('/popups');
  }

  updateForm<K extends keyof PopupUpsertRequest>(field: K, value: PopupUpsertRequest[K]): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  onPageChange(value: string): void {
    this.updateForm('page', value === '__home__' ? '' : value);
  }

  onActiveChange(active: boolean): void {
    this.updateForm('active', active);
  }

  onCollectEmailChange(collect: boolean): void {
    this.updateForm('collectEmail', collect);
  }

  onDelaySecondsChange(seconds: number): void {
    this.updateForm('delayMs', Math.max(0, Math.round((seconds || 0) * 1000)));
  }

  get delaySeconds(): number {
    return Math.round((this.form().delayMs || 0) / 100) / 10;
  }

  // Upload d'image / vidéo (Cloudinary)
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploadingField.set('image');
    this.cloudinary.upload(file, 'popups').subscribe({
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

  onVideoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploadingField.set('video');
    this.cloudinary.uploadVideo(file, 'popups').subscribe({
      next: (res) => {
        this.updateForm('video', res.secure_url);
        this.uploadingField.set(null);
      },
      error: (err: Error) => {
        this.uploadingField.set(null);
        this.toast.error(err?.message || "Erreur lors de l'envoi de la vidéo.");
      },
    });
  }

  get titleMissing(): boolean {
    return this.submitAttempted() && !this.form().title.trim();
  }

  submitForm(): void {
    this.submitAttempted.set(true);
    const f = this.form();
    if (!f.title.trim()) {
      this.formError.set('Le titre est obligatoire.');
      return;
    }
    this.formError.set(null);
    this.saving.set(true);

    const id = this.popupId;
    const request$ = id ? this.popupApi.update(id, f) : this.popupApi.create(f);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(id ? 'Popup mise à jour.' : 'Popup créée.');
        this.router.navigateByUrl('/popups');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.formError.set(
          extractApiErrorMessage(err, "Erreur lors de l'enregistrement : l'API backend correspondante n'existe pas encore.")
        );
      },
    });
  }
}
