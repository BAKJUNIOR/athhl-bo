
import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { Router } from '@angular/router';
import { LabelComponent } from '../../../../dashboard/presentation/components/form/label/label.component';
import { CheckboxComponent } from '../../../../dashboard/presentation/components/form/input/checkbox.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { InputFieldComponent } from '../../../../dashboard/presentation/components/form/input/input-field.component';
import { RouterModule } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { AuthApi } from '../../../infrastructure/api/auth.api';
import { StorageService } from '../../../../../core/services/storage.service';
import { JwtService } from '../../../../../core/services/jwt.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';

@Component({
  selector: 'app-signin-form',
  imports: [
    LabelComponent,
    CheckboxComponent,
    ButtonComponent,
    InputFieldComponent,
    RouterModule,
    FormsModule
],
  templateUrl: './signin-form.component.html',
  styles: ``
})
export class SigninFormComponent {
  private readonly authApi = inject(AuthApi);
  private readonly storage = inject(StorageService);
  private readonly jwt = inject(JwtService);
  private readonly toast = inject(ToastService);
  private readonly router = inject(Router);

  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  showPassword = false;
  isChecked = false;

  email = '';
  password = '';

  // Mutées de manière asynchrone (réponse HTTP) : l'app tourne sans zone.js
  // (aucune dépendance zone.js installée), donc une propriété classique modifiée
  // dans un callback .subscribe() ne déclenche jamais de re-rendu. Signal obligatoire ici.
  submitting = signal(false);
  errorMessage = signal('');

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }

  get emailInvalid(): boolean {
    const value = this.email.trim();
    return value.length > 0 && !this.emailPattern.test(value);
  }

  get emailHint(): string | undefined {
    return this.emailInvalid ? "Le format de l'email est invalide." : undefined;
  }

  onEmailChange(value: string) {
    this.email = value;
    if (this.errorMessage()) {
      this.errorMessage.set('');
    }
  }

  onSignIn() {
    if (this.submitting()) return;
    if (!this.email.trim() || !this.password) {
      this.errorMessage.set('Email et mot de passe requis.');
      return;
    }
    if (this.emailInvalid) {
      this.errorMessage.set("Le format de l'email est invalide.");
      return;
    }

    this.errorMessage.set('');
    this.submitting.set(true);

    this.authApi
      .authenticate({ email: this.email.trim(), password: this.password, rememberMe: this.isChecked })
      .subscribe({
        next: (res) => {
          this.submitting.set(false);
          this.storage.setToken(res.token, this.isChecked);
          const firstName = this.jwt.decodePayload(res.token)?.firstName;
          this.toast.success(`Connexion réussie ! Bienvenue${firstName ? ', ' + firstName : ''} 👋`);
          this.router.navigateByUrl('/');
        },
        error: (err: HttpErrorResponse) => {
          this.submitting.set(false);
          this.errorMessage.set(extractApiErrorMessage(err, 'Email ou mot de passe incorrect.'));
        },
      });
  }
}
