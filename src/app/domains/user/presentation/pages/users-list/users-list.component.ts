import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../../../dashboard/presentation/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../../dashboard/presentation/components/common/component-card/component-card.component';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ModalComponent } from '../../../../../shared/ui/modal/modal.component';
import { DropdownComponent } from '../../../../../shared/ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../../../../shared/ui/dropdown/dropdown-item/dropdown-item.component';
import { LabelComponent } from '../../../../dashboard/presentation/components/form/label/label.component';
import { InputFieldComponent } from '../../../../dashboard/presentation/components/form/input/input-field.component';
import { SelectComponent, Option } from '../../../../dashboard/presentation/components/form/select/select.component';
import { UserApi } from '../../../infrastructure/api/user.api';
import { RegisterUserRequest, RoleName, UserSummary, userFullName, userInitials, userRoleLabel } from '../../../domain/entities/user.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';

type ConfirmType = 'block' | 'unblock' | 'reset-password' | 'delete';

interface ConfirmState {
  type: ConfirmType;
  user: UserSummary;
  title: string;
  description: string;
  confirmLabel: string;
  danger: boolean;
}

@Component({
  selector: 'app-users-list',
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
    SelectComponent,
  ],
  templateUrl: './users-list.component.html',
})
export class UsersListComponent {
  private readonly userApi = inject(UserApi);
  private readonly toast = inject(ToastService);

  users = signal<UserSummary[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  search = signal('');
  roleFilter = signal<'' | RoleName>('');
  statusFilter = signal<'' | 'active' | 'inactive'>('');
  filtersOpen = signal(false);
  // Nombre de filtres actifs à la fois — le badge sur le bouton "Filtrer" ne s'affiche
  // qu'à partir de 2 (un seul filtre actif se voit déjà à la couleur du bouton).
  readonly activeFilterCount = computed(() => [this.roleFilter(), this.statusFilter()].filter(Boolean).length);

  readonly roleOptions: Option[] = [
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'SUPER_ADMIN', label: 'Super admin' },
  ];
  readonly roleFilterOptions: Option[] = [
    { value: '', label: 'Tous les rôles' },
    { value: 'ADMIN', label: 'Administrateur' },
    { value: 'SUPER_ADMIN', label: 'Super admin' },
  ];
  readonly statusFilterOptions: Option[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'active', label: 'Actif' },
    { value: 'inactive', label: 'Inactif / bloqué' },
  ];

  filteredUsers = computed(() => {
    const q = this.search().trim().toLowerCase();
    const role = this.roleFilter();
    const status = this.statusFilter();

    return this.users().filter((u) => {
      const matchesQuery =
        !q ||
        userFullName(u).toLowerCase().includes(q) ||
        u.email.toLowerCase().includes(q) ||
        (u.phoneNumber ?? '').toLowerCase().includes(q);

      const matchesRole = !role || u.roles?.some((r) => r.roleName === role);
      const matchesStatus =
        !status || (status === 'active' ? u.active : !u.active);

      return matchesQuery && matchesRole && matchesStatus;
    });
  });

  stats = computed(() => {
    const list = this.users();
    return {
      total: list.length,
      active: list.filter((u) => u.active).length,
      inactive: list.filter((u) => !u.active).length,
      admins: list.filter((u) => u.roles?.some((r) => r.roleName === 'SUPER_ADMIN')).length,
    };
  });

  // ── Menu ligne (⋮) ──
  openMenuId = signal<number | null>(null);

  // ── Modale création ──
  createOpen = signal(false);
  creating = signal(false);
  createError = signal<string | null>(null);
  createForm = signal<RegisterUserRequest>({
    firstName: '', lastName: '', email: '', phoneNumber: '', roleName: 'ADMIN',
  });
  submitAttempted = signal(false);
  private readonly emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  // ── Confirmation d'action ──
  confirm = signal<ConfirmState | null>(null);
  confirming = signal(false);

  constructor() {
    this.loadUsers();
  }

  loadUsers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.userApi.list().subscribe({
      next: (list) => {
        this.users.set(list ?? []);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(extractApiErrorMessage(err, 'Impossible de charger la liste des utilisateurs.'));
        this.loading.set(false);
      },
    });
  }

  fullName = userFullName;
  initials = userInitials;
  roleLabel = userRoleLabel;

  formatDate(iso: string): string {
    try {
      return new Date(iso).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric' });
    } catch {
      return iso;
    }
  }

  toggleMenu(id: number): void {
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  toggleFilters(): void {
    this.filtersOpen.update((v) => !v);
  }

  // ── Création ──
  openCreate(): void {
    this.createForm.set({ firstName: '', lastName: '', email: '', phoneNumber: '', roleName: 'ADMIN' });
    this.createError.set(null);
    this.submitAttempted.set(false);
    this.createOpen.set(true);
  }

  get emailFormatInvalid(): boolean {
    const value = this.createForm().email.trim();
    return value.length > 0 && !this.emailPattern.test(value);
  }

  get firstNameMissing(): boolean {
    return this.submitAttempted() && !this.createForm().firstName.trim();
  }

  get lastNameMissing(): boolean {
    return this.submitAttempted() && !this.createForm().lastName.trim();
  }

  get emailMissing(): boolean {
    return this.submitAttempted() && !this.createForm().email.trim();
  }

  get emailInvalid(): boolean {
    return this.emailMissing || this.emailFormatInvalid;
  }

  get emailHint(): string | undefined {
    if (this.emailMissing) return "L'email est requis.";
    if (this.emailFormatInvalid) return "Le format de l'email est invalide.";
    return undefined;
  }

  get firstNameHint(): string | undefined {
    return this.firstNameMissing ? 'Le prénom est requis.' : undefined;
  }

  get lastNameHint(): string | undefined {
    return this.lastNameMissing ? 'Le nom est requis.' : undefined;
  }

  closeCreate(): void {
    if (this.creating()) return;
    this.createOpen.set(false);
  }

  updateCreateForm<K extends keyof RegisterUserRequest>(field: K, value: RegisterUserRequest[K]): void {
    this.createForm.update((f) => ({ ...f, [field]: value }));
  }

  submitCreate(): void {
    this.submitAttempted.set(true);
    const f = this.createForm();
    if (!f.firstName.trim() || !f.lastName.trim() || !f.email.trim() || !f.roleName) {
      this.createError.set('Tous les champs sont obligatoires, sauf le téléphone.');
      return;
    }
    if (this.emailFormatInvalid) {
      this.createError.set("Le format de l'email est invalide.");
      return;
    }
    this.createError.set(null);
    this.creating.set(true);

    const payload: RegisterUserRequest = {
      firstName: f.firstName.trim(),
      lastName: f.lastName.trim(),
      email: f.email.trim(),
      roleName: f.roleName,
      ...(f.phoneNumber?.trim() ? { phoneNumber: f.phoneNumber.trim() } : {}),
    };

    this.userApi.register(payload).subscribe({
      next: () => {
        this.creating.set(false);
        this.createOpen.set(false);
        this.toast.success(`Utilisateur créé. Un email d'activation a été envoyé à ${payload.email}.`);
        this.loadUsers();
      },
      error: (err: HttpErrorResponse) => {
        this.creating.set(false);
        this.createError.set(extractApiErrorMessage(err, "Erreur lors de la création de l'utilisateur."));
      },
    });
  }

  // ── Actions ligne ──
  askBlock(u: UserSummary): void {
    this.closeMenu();
    this.confirm.set({
      type: 'block', user: u, danger: true,
      title: 'Bloquer cet utilisateur ?',
      description: `${userFullName(u)} ne pourra plus se connecter au back-office.`,
      confirmLabel: 'Bloquer',
    });
  }

  askUnblock(u: UserSummary): void {
    this.closeMenu();
    this.confirm.set({
      type: 'unblock', user: u, danger: false,
      title: 'Débloquer cet utilisateur ?',
      description: `${userFullName(u)} pourra de nouveau se connecter au back-office.`,
      confirmLabel: 'Débloquer',
    });
  }

  askResetPassword(u: UserSummary): void {
    this.closeMenu();
    this.confirm.set({
      type: 'reset-password', user: u, danger: false,
      title: 'Réinitialiser le mot de passe ?',
      description: `Un nouveau mot de passe temporaire sera envoyé par email à ${u.email}.`,
      confirmLabel: 'Envoyer',
    });
  }

  askDelete(u: UserSummary): void {
    this.closeMenu();
    this.confirm.set({
      type: 'delete', user: u, danger: true,
      title: 'Supprimer définitivement cet utilisateur ?',
      description: `Cette action est irréversible. ${userFullName(u)} perdra immédiatement l'accès au back-office.`,
      confirmLabel: 'Supprimer',
    });
  }

  cancelConfirm(): void {
    if (this.confirming()) return;
    this.confirm.set(null);
  }

  runConfirm(): void {
    const state = this.confirm();
    if (!state || this.confirming()) return;
    this.confirming.set(true);

    const { type, user } = state;
    const obs =
      type === 'block' ? this.userApi.block(user.id) :
      type === 'unblock' ? this.userApi.unblock(user.id) :
      type === 'reset-password' ? this.userApi.resetPassword(user.id) :
      this.userApi.delete(user.id);

    const successMessages: Record<ConfirmType, string> = {
      'block': `${userFullName(user)} a été bloqué.`,
      'unblock': `${userFullName(user)} a été débloqué.`,
      'reset-password': `Mot de passe réinitialisé, un email a été envoyé à ${user.email}.`,
      'delete': `${userFullName(user)} a été supprimé.`,
    };

    obs.subscribe({
      next: () => {
        this.confirming.set(false);
        this.confirm.set(null);
        this.toast.success(successMessages[type]);
        this.loadUsers();
      },
      error: () => {
        // Le message d'erreur est déjà affiché par l'intercepteur global.
        this.confirming.set(false);
      },
    });
  }
}
