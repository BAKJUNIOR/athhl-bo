import { Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../../../dashboard/presentation/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../../dashboard/presentation/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ModalComponent } from '../../../../../shared/ui/modal/modal.component';
import { LabelComponent } from '../../../../dashboard/presentation/components/form/label/label.component';
import { InputFieldComponent } from '../../../../dashboard/presentation/components/form/input/input-field.component';
import { TeamApi } from '../../../infrastructure/api/team.api';
import { CloudinaryUploadService } from '../../../../../core/services/cloudinary-upload.service';
import { TeamMember, TeamMemberUpsertRequest, emptyTeamMemberForm } from '../../../domain/entities/team-member.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';

@Component({
  selector: 'app-team-list',
  standalone: true,
  imports: [
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    ModalComponent,
    LabelComponent,
    InputFieldComponent,
  ],
  templateUrl: './team-list.component.html',
})
export class TeamListComponent {
  private readonly teamApi = inject(TeamApi);
  private readonly cloudinary = inject(CloudinaryUploadService);
  private readonly toast = inject(ToastService);

  members = signal<TeamMember[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  sortedMembers = computed(() => [...this.members()].sort((a, b) => a.sortOrder - b.sortOrder));

  // ── Modale création/édition ──
  formOpen = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);
  formError = signal<string | null>(null);
  form = signal<TeamMemberUpsertRequest>(emptyTeamMemberForm(1));
  submitAttempted = signal(false);
  uploadingPhoto = signal(false);

  // ── Confirmation de suppression ──
  deleteTarget = signal<TeamMember | null>(null);
  deleting = signal(false);

  constructor() {
    this.loadMembers();
  }

  loadMembers(): void {
    this.loading.set(true);
    this.error.set(null);
    this.teamApi.list().subscribe({
      next: (list) => {
        this.members.set(list ?? []);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(extractApiErrorMessage(err, "Erreur lors du chargement de l'équipe."));
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
    const nextOrder = this.members().length ? Math.max(...this.members().map((m) => m.sortOrder)) + 1 : 1;
    this.form.set(emptyTeamMemberForm(nextOrder));
    this.submitAttempted.set(false);
    this.formError.set(null);
    this.formOpen.set(true);
  }

  openEdit(member: TeamMember): void {
    const { id, updatedAt, ...rest } = member;
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

  updateForm<K extends keyof TeamMemberUpsertRequest>(field: K, value: TeamMemberUpsertRequest[K]): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  onPhotoSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploadingPhoto.set(true);
    this.cloudinary.upload(file, 'team').subscribe({
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

  submitForm(): void {
    this.submitAttempted.set(true);
    const f = this.form();
    if (!f.name.trim() || !f.roleFr.trim()) {
      this.formError.set('Le nom et le rôle (FR) sont obligatoires.');
      return;
    }
    this.formError.set(null);
    this.saving.set(true);

    const id = this.editingId();
    const request$ = id ? this.teamApi.update(id, f) : this.teamApi.create(f);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.formOpen.set(false);
        this.toast.success(id ? 'Membre mis à jour.' : 'Membre ajouté.');
        this.loadMembers();
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.formError.set(
          extractApiErrorMessage(err, "Erreur lors de l'enregistrement : l'API backend correspondante n'existe pas encore.")
        );
      },
    });
  }

  askDelete(member: TeamMember): void {
    this.deleteTarget.set(member);
  }

  cancelDelete(): void {
    if (this.deleting()) return;
    this.deleteTarget.set(null);
  }

  confirmDelete(): void {
    const target = this.deleteTarget();
    if (!target) return;
    this.deleting.set(true);
    this.teamApi.delete(target.id).subscribe({
      next: () => {
        this.deleting.set(false);
        this.deleteTarget.set(null);
        this.toast.success('Membre retiré.');
        this.loadMembers();
      },
      error: (err: HttpErrorResponse) => {
        this.deleting.set(false);
        this.toast.error(extractApiErrorMessage(err, 'Erreur lors de la suppression.'));
      },
    });
  }
}
