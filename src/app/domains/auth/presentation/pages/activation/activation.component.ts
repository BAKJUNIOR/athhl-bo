import { Component, ElementRef, QueryList, ViewChildren, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { AuthPageLayoutComponent } from '../../../../../layout/auth-page-layout/auth-page-layout.component';
import { LabelComponent } from '../../../../dashboard/presentation/components/form/label/label.component';
import { InputFieldComponent } from '../../../../dashboard/presentation/components/form/input/input-field.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { AuthApi } from '../../../infrastructure/api/auth.api';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';
import { ToastService } from '../../../../../core/services/toast.service';
import {FormsModule} from "@angular/forms";

@Component({
  selector: 'app-activation',
  standalone: true,
    imports: [AuthPageLayoutComponent, LabelComponent, InputFieldComponent, ButtonComponent, RouterModule, FormsModule],
  templateUrl: './activation.component.html',
})
export class ActivationComponent {
  private readonly authApi = inject(AuthApi);
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly toast = inject(ToastService);

  static readonly CODE_LENGTH = 6;
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  code = '';
  codeDigits: string[] = Array(ActivationComponent.CODE_LENGTH).fill('');
  newPassword = '';
  confirmPassword = '';
  email = '';

  // Mutées de manière asynchrone (réponse HTTP) : l'app tourne sans zone.js
  // (aucune dépendance zone.js installée), donc une propriété classique modifiée
  // dans un callback .subscribe() ne déclenche jamais de re-rendu. Signal obligatoire ici.
  submitting = signal(false);
  errorMessage = signal('');
  success = signal(false);

  showResend = false;
  resending = signal(false);
  resendMessage = signal('');
  resendError = signal(false);

  showNewPassword = false;
  showConfirmPassword = false;

  @ViewChildren('otpInput') private otpInputs!: QueryList<ElementRef<HTMLInputElement>>;

  get codeComplete(): boolean {
    return this.codeDigits.every((d) => d.length > 0);
  }

  get emailInvalid(): boolean {
    const value = this.email.trim();
    return value.length > 0 && !this.emailPattern.test(value);
  }

  get emailHint(): string | undefined {
    return this.emailInvalid ? "Le format de l'email est invalide." : undefined;
  }

  onEmailChange(value: string): void {
    this.email = value;
    if (this.resendMessage()) {
      this.resendMessage.set('');
    }
  }

  ngOnInit(): void {
    const codeParam = this.route.snapshot.queryParamMap.get('code');
    if (codeParam) {
      const chars = codeParam.trim().slice(0, ActivationComponent.CODE_LENGTH).split('');
      this.codeDigits = Array.from({ length: ActivationComponent.CODE_LENGTH }, (_, i) => chars[i] ?? '');
      this.code = this.codeDigits.join('');
    }
  }

  onDigitInput(index: number, event: Event): void {
    const input = event.target as HTMLInputElement;
    const value = input.value.replace(/\D/g, '').slice(-1);
    this.codeDigits[index] = value;
    input.value = value;
    this.code = this.codeDigits.join('');

    if (value && index < ActivationComponent.CODE_LENGTH - 1) {
      this.focusBox(index + 1);
    }
  }

  onDigitKeydown(index: number, event: KeyboardEvent): void {
    if (event.key === 'Backspace' && !this.codeDigits[index] && index > 0) {
      this.focusBox(index - 1);
    }
  }

  onDigitPaste(index: number, event: ClipboardEvent): void {
    event.preventDefault();
    const pasted = (event.clipboardData?.getData('text') ?? '').replace(/\D/g, '');
    if (!pasted) return;

    const chars = pasted.split('');
    for (let i = 0; i < ActivationComponent.CODE_LENGTH; i++) {
      this.codeDigits[i] = chars[i] ?? this.codeDigits[i] ?? '';
    }
    this.code = this.codeDigits.join('');
    this.focusBox(Math.min(chars.length, ActivationComponent.CODE_LENGTH) - 1);
  }

  private focusBox(index: number): void {
    const el = this.otpInputs?.get(Math.max(index, 0))?.nativeElement;
    el?.focus();
    el?.select();
  }

  activate(): void {
    if (this.submitting()) return;
    this.errorMessage.set('');

    if (!this.code.trim()) {
      this.errorMessage.set("Le code d'activation est requis.");
      return;
    }
    if (this.newPassword.length < 8) {
      this.errorMessage.set('Le mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (this.newPassword !== this.confirmPassword) {
      this.errorMessage.set('Les mots de passe ne correspondent pas.');
      return;
    }

    this.submitting.set(true);
    this.authApi.activate({ code: this.code.trim(), newPassword: this.newPassword }).subscribe({
      next: () => {
        this.submitting.set(false);
        this.success.set(true);
      },
      error: (err: HttpErrorResponse) => {
        this.submitting.set(false);
        this.errorMessage.set(extractApiErrorMessage(
          err,
          "Code invalide, expiré ou déjà utilisé. Demandez un nouveau code ci-dessous."
        ));
      },
    });
  }

  resendCode(): void {
    if (this.resending() || !this.email.trim() || this.emailInvalid) return;
    this.resending.set(true);
    this.resendMessage.set('');
    this.resendError.set(false);
    this.authApi.resendActivationCode({ email: this.email.trim() }).subscribe({
      next: () => {
        this.resending.set(false);
        this.resendError.set(false);
        this.resendMessage.set('');
        this.codeDigits = Array(ActivationComponent.CODE_LENGTH).fill('');
        this.code = '';
        this.showResend = false;
        this.toast.success('Un nouveau code a été envoyé par email.');
      },
      error: (err: HttpErrorResponse) => {
        this.resending.set(false);
        this.resendError.set(true);
        this.resendMessage.set(extractApiErrorMessage(err, "Impossible d'envoyer un nouveau code."));
      },
    });
  }

  goToSignin(): void {
    this.router.navigateByUrl('/signin');
  }
}
