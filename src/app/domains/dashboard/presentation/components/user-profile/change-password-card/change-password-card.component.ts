import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { LabelComponent } from '../../form/label/label.component';
import { InputFieldComponent } from '../../form/input/input-field.component';
import { ModalComponent } from '../../../../../../shared/ui/modal/modal.component';
import { ButtonComponent } from '../../../../../../shared/ui/button/button.component';
import { AuthApi } from '../../../../../auth/infrastructure/api/auth.api';
import { ToastService } from '../../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../../core/utils/api-error.util';

@Component({
  selector: 'app-change-password-card',
  standalone: true,
  imports: [LabelComponent, InputFieldComponent, ModalComponent, ButtonComponent],
  templateUrl: './change-password-card.component.html',
})
export class ChangePasswordCardComponent {
  private readonly authApi = inject(AuthApi);
  private readonly toast = inject(ToastService);

  isOpen = signal(false);
  saving = signal(false);
  error = signal<string | null>(null);

  currentPassword = signal('');
  newPassword = signal('');
  confirmPassword = signal('');

  showCurrentPassword = signal(false);
  showNewPassword = signal(false);
  showConfirmPassword = signal(false);

  open(): void {
    this.currentPassword.set('');
    this.newPassword.set('');
    this.confirmPassword.set('');
    this.showCurrentPassword.set(false);
    this.showNewPassword.set(false);
    this.showConfirmPassword.set(false);
    this.error.set(null);
    this.isOpen.set(true);
  }

  close(): void {
    if (this.saving()) return;
    this.isOpen.set(false);
  }

  submit(): void {
    if (!this.currentPassword()) {
      this.error.set('Le mot de passe actuel est requis.');
      return;
    }
    if (this.newPassword().length < 8) {
      this.error.set('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (this.newPassword() !== this.confirmPassword()) {
      this.error.set('Les mots de passe ne correspondent pas.');
      return;
    }

    this.error.set(null);
    this.saving.set(true);
    this.authApi
      .changePassword({ currentPassword: this.currentPassword(), newPassword: this.newPassword() })
      .subscribe({
        next: () => {
          this.saving.set(false);
          this.isOpen.set(false);
          this.toast.success('Mot de passe modifié avec succès.');
        },
        error: (err: HttpErrorResponse) => {
          this.saving.set(false);
          // Message métier (ex: mot de passe actuel incorrect) affiché ici plutôt qu'en toast global,
          // pour rester visible dans la modale plutôt qu'en coin d'écran.
          this.error.set(extractApiErrorMessage(err, 'Erreur lors du changement de mot de passe.'));
        },
      });
  }
}
