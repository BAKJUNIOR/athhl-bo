import { Component, OnInit, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { LabelComponent } from '../../form/label/label.component';
import { ModalComponent } from '../../../../../../shared/ui/modal/modal.component';
import { ButtonComponent } from '../../../../../../shared/ui/button/button.component';
import { BadgeComponent } from '../../../../../../shared/ui/badge/badge.component';
import { AuthApi } from '../../../../../auth/infrastructure/api/auth.api';
import { CurrentUser, UpdateProfileRequest } from '../../../../../auth/domain/entities/auth.entity';
import { CloudinaryUploadService } from '../../../../../../core/services/cloudinary-upload.service';
import { ToastService } from '../../../../../../core/services/toast.service';

@Component({
  selector: 'app-user-meta-card',
  standalone: true,
  imports: [
    ModalComponent,
    InputFieldComponent,
    LabelComponent,
    ButtonComponent,
    BadgeComponent,
  ],
  templateUrl: './user-meta-card.component.html',
})
export class UserMetaCardComponent implements OnInit {
  private readonly authApi = inject(AuthApi);
  private readonly cloudinary = inject(CloudinaryUploadService);
  private readonly toast = inject(ToastService);

  loading = signal(true);
  user = signal<CurrentUser | null>(null);

  isInfoModalOpen = signal(false);
  saving = signal(false);
  uploadingPhoto = signal(false);
  editForm = signal<UpdateProfileRequest>({ firstName: '', lastName: '', phoneNumber: '', profilePictureUrl: '' });

  ngOnInit(): void {
    this.load();
  }

  private load(): void {
    this.loading.set(true);
    this.authApi.currentUser().subscribe({
      next: (u) => {
        this.user.set(u);
        this.loading.set(false);
      },
      error: () => this.loading.set(false),
    });
  }

  initials(): string {
    const u = this.user();
    if (!u) return '?';
    return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() || '?';
  }

  roleLabel(): string {
    const role = this.user()?.roles?.[0]?.roleName;
    return role === 'SUPER_ADMIN' ? 'Super administrateur' : role === 'ADMIN' ? 'Administrateur' : '—';
  }

  openInfoModal(): void {
    const u = this.user();
    if (!u) return;
    this.editForm.set({
      firstName: u.firstName,
      lastName: u.lastName,
      phoneNumber: u.phoneNumber ?? '',
      profilePictureUrl: u.profilePictureUrl ?? '',
    });
    this.isInfoModalOpen.set(true);
  }

  closeInfoModal(): void {
    if (this.saving()) return;
    this.isInfoModalOpen.set(false);
  }

  updateField<K extends keyof UpdateProfileRequest>(field: K, value: UpdateProfileRequest[K]): void {
    this.editForm.update((f) => ({ ...f, [field]: value }));
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploadingPhoto.set(true);
    this.cloudinary.upload(file, 'profile-pictures').subscribe({
      next: (res) => {
        this.updateField('profilePictureUrl', res.secure_url);
        this.uploadingPhoto.set(false);
      },
      error: (err: Error) => {
        this.uploadingPhoto.set(false);
        this.toast.error(err?.message || "Erreur lors de l'envoi de la photo.");
      },
    });
  }

  handleInfoSave(): void {
    const f = this.editForm();
    if (!f.firstName.trim() || !f.lastName.trim()) {
      this.toast.error('Prénom et nom sont obligatoires.');
      return;
    }

    this.saving.set(true);
    this.authApi
      .updateProfile({
        firstName: f.firstName.trim(),
        lastName: f.lastName.trim(),
        phoneNumber: f.phoneNumber?.trim() || undefined,
        profilePictureUrl: f.profilePictureUrl || undefined,
      })
      .subscribe({
        next: (updated) => {
          this.user.set(updated);
          this.saving.set(false);
          this.isInfoModalOpen.set(false);
          this.toast.success('Profil mis à jour.');
        },
        error: (_err: HttpErrorResponse) => {
          // Le message d'erreur est déjà affiché par l'intercepteur global.
          this.saving.set(false);
        },
      });
  }
}
