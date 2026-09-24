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
import { DatePickerComponent } from '../../../../dashboard/presentation/components/form/date-picker/date-picker.component';
import { JobApi } from '../../../infrastructure/api/job.api';
import { JobDomainApi } from '../../../infrastructure/api/job-domain.api';
import {
  JobBullet,
  JobDomainOption,
  JobUpsertRequest,
  emptyBullet,
  emptyJobForm,
  jobStatusLabel,
} from '../../../domain/entities/job-offer.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';
import { ModalComponent } from '../../../../../shared/ui/modal/modal.component';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-job-form',
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
    DatePickerComponent,
    ModalComponent,
    FormsModule,
  ],
  templateUrl: './job-form.component.html',
})
export class JobFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly jobApi = inject(JobApi);
  private readonly jobDomainApi = inject(JobDomainApi);
  private readonly toast = inject(ToastService);

  readonly jobId = this.resolveId();
  readonly isEdit = this.jobId !== null;

  loading = signal(this.isEdit);
  loadError = signal<string | null>(null);

  saving = signal(false);
  formError = signal<string | null>(null);
  submitAttempted = signal(false);

  form = signal<JobUpsertRequest>(emptyJobForm());

  domains = signal<JobDomainOption[]>([]);
  readonly domainOptions = () =>
    this.domains().map((d): Option => ({ value: String(d.id), label: d.labelFr }));

  domainModalOpen = signal(false);

  domainDrafts = signal<Record<number, { labelFr: string; labelEn: string }>>({});
  savingDomainId = signal<number | null>(null);
  deletingDomainId = signal<number | null>(null);

  newDomainLabelFr = signal('');
  newDomainLabelEn = signal('');
  savingNewDomain = signal(false);

  statusLabel = jobStatusLabel;

  constructor() {
    this.loadDomains();
    if (this.isEdit) {
      this.loadJob();
    }
  }

  private resolveId(): number | null {
    const raw = this.route.snapshot.paramMap.get('id');
    if (!raw) return null;
    const id = Number(raw);
    return Number.isFinite(id) ? id : null;
  }

  private loadDomains(): void {
    this.jobDomainApi.list().subscribe({
      next: (list) => this.domains.set(list ?? []),
      error: () => this.domains.set([]),
    });
  }

  private loadJob(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.jobApi.getById(this.jobId!).subscribe({
      next: (job) => {
        const { id, updatedAt, domain, ...rest } = job;
        this.form.set({ ...rest, domainId: domain.id });
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loadError.set(
          extractApiErrorMessage(
            err,
            "Impossible de charger cette offre : l'API backend correspondante n'existe pas encore.",
          ),
        );
        this.loading.set(false);
      },
    });
  }

  cancel(): void {
    if (this.saving()) return;
    this.router.navigateByUrl('/jobs');
  }

  updateForm<K extends keyof JobUpsertRequest>(field: K, value: JobUpsertRequest[K]): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  onDomainChange(value: string): void {
    this.updateForm('domainId', Number(value));
  }

  openDomainModal(): void {
    this.domainDrafts.set(
      Object.fromEntries(
        this.domains().map((d) => [d.id, { labelFr: d.labelFr, labelEn: d.labelEn || '' }]),
      ),
    );
    this.newDomainLabelFr.set('');
    this.newDomainLabelEn.set('');
    this.domainModalOpen.set(true);
  }

  closeDomainModal(): void {
    this.domainModalOpen.set(false);
  }

  domainDraft(id: number): { labelFr: string; labelEn: string } {
    return this.domainDrafts()[id] ?? { labelFr: '', labelEn: '' };
  }

  updateDomainDraft(id: number, field: 'labelFr' | 'labelEn', value: string): void {
    this.domainDrafts.update((drafts) => ({
      ...drafts,
      [id]: { ...this.domainDraft(id), [field]: value },
    }));
  }

  saveDomainEdit(domain: JobDomainOption): void {
    const draft = this.domainDraft(domain.id);
    if (!draft.labelFr.trim() || this.savingDomainId()) return;
    this.savingDomainId.set(domain.id);
    this.jobDomainApi
      .update(domain.id, { labelFr: draft.labelFr.trim(), labelEn: draft.labelEn.trim() })
      .subscribe({
        next: (updated) => {
          this.domains.update((list) => list.map((d) => (d.id === updated.id ? updated : d)));
          this.savingDomainId.set(null);
          this.toast.success(`Domaine « ${updated.labelFr} » mis à jour.`);
        },
        error: (err: HttpErrorResponse) => {
          this.savingDomainId.set(null);
          this.toast.error(
            extractApiErrorMessage(err, 'Erreur lors de la mise à jour du domaine.'),
          );
        },
      });
  }

  deleteDomain(domain: JobDomainOption): void {
    if (this.deletingDomainId()) return;
    if (!confirm(`Supprimer le domaine « ${domain.labelFr} » ? Cette action est irréversible.`))
      return;
    this.deletingDomainId.set(domain.id);
    this.jobDomainApi.delete(domain.id).subscribe({
      next: () => {
        this.domains.update((list) => list.filter((d) => d.id !== domain.id));
        if (this.form().domainId === domain.id) {
          this.updateForm('domainId', 0);
        }
        this.deletingDomainId.set(null);
        this.toast.success(`Domaine « ${domain.labelFr} » supprimé.`);
      },
      error: (err: HttpErrorResponse) => {
        this.deletingDomainId.set(null);
        this.toast.error(extractApiErrorMessage(err, 'Erreur lors de la suppression du domaine.'));
      },
    });
  }

  addDomain(): void {
    const label = this.newDomainLabelFr().trim();
    if (!label || this.savingNewDomain()) return;
    this.savingNewDomain.set(true);
    this.jobDomainApi
      .create({ labelFr: label, labelEn: this.newDomainLabelEn().trim() })
      .subscribe({
        next: (created) => {
          this.domains.update((list) => [...list, created]);
          this.domainDrafts.update((drafts) => ({
            ...drafts,
            [created.id]: { labelFr: created.labelFr, labelEn: created.labelEn || '' },
          }));
          this.updateForm('domainId', created.id);
          this.savingNewDomain.set(false);
          this.newDomainLabelFr.set('');
          this.newDomainLabelEn.set('');
          this.toast.success(`Domaine « ${created.labelFr} » ajouté.`);
        },
        error: (err: HttpErrorResponse) => {
          this.savingNewDomain.set(false);
          this.toast.error(extractApiErrorMessage(err, "Erreur lors de l'ajout du domaine."));
        },
      });
  }

  onStatusChange(published: boolean): void {
    this.updateForm('status', published ? 'published' : 'draft');
  }

  onPublishedAtChange(dateStr: string): void {
    this.updateForm('publishedAt', dateStr);
  }

  onDeadlineChange(dateStr: string): void {
    this.updateForm('deadline', dateStr);
  }

  // Missions
  addMission(): void {
    this.form.update((f) => ({ ...f, missions: [...f.missions, emptyBullet()] }));
  }

  removeMission(index: number): void {
    this.form.update((f) => ({ ...f, missions: f.missions.filter((_, i) => i !== index) }));
  }

  updateMission(index: number, field: keyof JobBullet, value: string): void {
    this.form.update((f) => ({
      ...f,
      missions: f.missions.map((m, i) => (i === index ? { ...m, [field]: value } : m)),
    }));
  }

  // Profil recherché
  addProfileItem(): void {
    this.form.update((f) => ({ ...f, profile: [...f.profile, emptyBullet()] }));
  }

  removeProfileItem(index: number): void {
    this.form.update((f) => ({ ...f, profile: f.profile.filter((_, i) => i !== index) }));
  }

  updateProfileItem(index: number, field: keyof JobBullet, value: string): void {
    this.form.update((f) => ({
      ...f,
      profile: f.profile.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }));
  }

  get titleFrMissing(): boolean {
    return this.submitAttempted() && !this.form().titleFr.trim();
  }

  get deadlineMissing(): boolean {
    return this.submitAttempted() && !this.form().deadline.trim();
  }

  get domainMissing(): boolean {
    return this.submitAttempted() && !this.form().domainId;
  }

  get domainIdStr(): string {
    return this.form().domainId ? String(this.form().domainId) : '';
  }

  get selectedDomainLabel(): string {
    return this.domains().find((d) => d.id === this.form().domainId)?.labelFr ?? '—';
  }

  submitForm(): void {
    this.submitAttempted.set(true);
    const f = this.form();
    if (!f.titleFr.trim() || !f.deadline.trim() || !f.domainId) {
      this.formError.set('Le titre (FR), le domaine et la date de clôture sont obligatoires.');
      return;
    }
    this.formError.set(null);
    this.saving.set(true);

    const id = this.jobId;
    const request$ = id ? this.jobApi.update(id, f) : this.jobApi.create(f);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(id ? 'Offre mise à jour.' : 'Offre créée.');
        this.router.navigateByUrl('/jobs');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.formError.set(
          extractApiErrorMessage(
            err,
            "Erreur lors de l'enregistrement : l'API backend correspondante n'existe pas encore.",
          ),
        );
      },
    });
  }
}
