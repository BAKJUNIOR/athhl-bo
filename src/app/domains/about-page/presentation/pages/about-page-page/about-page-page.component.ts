import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ComponentCardComponent } from '../../../../dashboard/presentation/components/common/component-card/component-card.component';
import { PageBreadcrumbComponent } from '../../../../dashboard/presentation/components/common/page-breadcrumb/page-breadcrumb.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { LabelComponent } from '../../../../dashboard/presentation/components/form/label/label.component';
import { InputFieldComponent } from '../../../../dashboard/presentation/components/form/input/input-field.component';
import { TextAreaComponent } from '../../../../dashboard/presentation/components/form/input/text-area.component';
import { AboutPageApi } from '../../../infrastructure/api/about-page.api';
import { CloudinaryUploadService } from '../../../../../core/services/cloudinary-upload.service';
import {
  AboutCommitment,
  AboutGroundRole,
  AboutPageContent,
  AboutPillar,
  AboutValue,
  AboutWorkforceTab,
  ABOUT_PAGE_DEFAULTS,
  emptyAboutCommitment,
  emptyAboutGroundRole,
  emptyAboutPillar,
  emptyAboutValue,
  emptyAboutWorkforceTab,
  emptyAboutWorkforceStat,
} from '../../../domain/entities/about-page.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';

type AboutSection = 'intro' | 'pillars' | 'teams' | 'values';

const ABOUT_SECTIONS: { key: AboutSection; label: string }[] = [
  { key: 'intro', label: 'Introduction' },
  { key: 'pillars', label: 'Nos 3 métiers' },
  { key: 'teams', label: 'Équipes' },
  { key: 'values', label: 'Ce qui nous engage' },
];

@Component({
  selector: 'app-about-page-page',
  standalone: true,
  imports: [
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    LabelComponent,
    InputFieldComponent,
    TextAreaComponent,
  ],
  templateUrl: './about-page-page.component.html',
})
export class AboutPagePageComponent {
  private readonly aboutPageApi = inject(AboutPageApi);
  private readonly cloudinary = inject(CloudinaryUploadService);
  private readonly toast = inject(ToastService);

  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);
  uploadingField = signal<string | null>(null);

  readonly sections = ABOUT_SECTIONS;
  activeSection = signal<AboutSection>('intro');

  content = signal<AboutPageContent>(ABOUT_PAGE_DEFAULTS);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.aboutPageApi.get().subscribe({
      next: (content) => {
        this.content.set(content ?? ABOUT_PAGE_DEFAULTS);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(extractApiErrorMessage(err, 'Erreur lors du chargement du contenu.'));
        this.loading.set(false);
      },
    });
  }

  update<K extends keyof AboutPageContent>(field: K, value: AboutPageContent[K]): void {
    this.content.update((c) => ({ ...c, [field]: value }));
  }

  // Onglets "Bienvenue chez ATHL" (accueil + À propos, même donnée)
  updateWorkforceTab(index: number, field: Exclude<keyof AboutWorkforceTab, 'image' | 'heroImage' | 'stats'>, value: string): void {
    this.content.update((c) => ({
      ...c,
      workforceTabs: c.workforceTabs.map((t, i) => (i === index ? { ...t, [field]: value } : t)),
    }));
  }

  addWorkforceTab(): void {
    this.content.update((c) => ({ ...c, workforceTabs: [...c.workforceTabs, emptyAboutWorkforceTab(c.workforceTabs.length + 1)] }));
  }

  removeWorkforceTab(index: number): void {
    this.content.update((c) => ({ ...c, workforceTabs: c.workforceTabs.filter((_, i) => i !== index) }));
  }

  onWorkforceTabImageSelected(event: Event, index: number, field: 'image' | 'heroImage'): void {
    const file = this.pickFile(event);
    if (!file) return;
    const key = `workforce-${field}-${index}`;
    this.uploadingField.set(key);
    this.cloudinary.upload(file, 'about-page/workforce').subscribe({
      next: (res) => {
        this.content.update((c) => ({
          ...c,
          workforceTabs: c.workforceTabs.map((t, i) => (i === index ? { ...t, [field]: res.secure_url } : t)),
        }));
        this.uploadingField.set(null);
      },
      error: (err: Error) => {
        this.uploadingField.set(null);
        this.toast.error(err?.message || "Erreur lors de l'envoi de l'image.");
      },
    });
  }

  updateWorkforceStat(tabIndex: number, statIndex: number, field: 'labelFr' | 'labelEn' | 'suffix', value: string): void {
    this.content.update((c) => ({
      ...c,
      workforceTabs: c.workforceTabs.map((t, i) =>
        i === tabIndex ? { ...t, stats: t.stats.map((s, si) => (si === statIndex ? { ...s, [field]: value } : s)) } : t
      ),
    }));
  }

  updateWorkforceStatNumber(tabIndex: number, statIndex: number, field: 'value' | 'decimals', value: string): void {
    this.content.update((c) => ({
      ...c,
      workforceTabs: c.workforceTabs.map((t, i) =>
        i === tabIndex ? { ...t, stats: t.stats.map((s, si) => (si === statIndex ? { ...s, [field]: Number(value) || 0 } : s)) } : t
      ),
    }));
  }

  addWorkforceStat(tabIndex: number): void {
    this.content.update((c) => ({
      ...c,
      workforceTabs: c.workforceTabs.map((t, i) => (i === tabIndex ? { ...t, stats: [...t.stats, emptyAboutWorkforceStat()] } : t)),
    }));
  }

  removeWorkforceStat(tabIndex: number, statIndex: number): void {
    this.content.update((c) => ({
      ...c,
      workforceTabs: c.workforceTabs.map((t, i) => (i === tabIndex ? { ...t, stats: t.stats.filter((_, si) => si !== statIndex) } : t)),
    }));
  }

  // Pilliers ("Nos 3 métiers")
  updatePillar(index: number, field: Exclude<keyof AboutPillar, 'image'>, value: string): void {
    this.content.update((c) => ({
      ...c,
      pillars: c.pillars.map((p, i) => (i === index ? { ...p, [field]: value } : p)),
    }));
  }

  addPillar(): void {
    this.content.update((c) => ({ ...c, pillars: [...c.pillars, emptyAboutPillar()] }));
  }

  removePillar(index: number): void {
    this.content.update((c) => ({ ...c, pillars: c.pillars.filter((_, i) => i !== index) }));
  }

  onPillarImageSelected(event: Event, index: number): void {
    const file = this.pickFile(event);
    if (!file) return;
    const key = `pillar-${index}`;
    this.uploadingField.set(key);
    this.cloudinary.upload(file, 'about-page').subscribe({
      next: (res) => {
        this.content.update((c) => ({
          ...c,
          pillars: c.pillars.map((p, i) => (i === index ? { ...p, image: res.secure_url } : p)),
        }));
        this.uploadingField.set(null);
      },
      error: (err: Error) => {
        this.uploadingField.set(null);
        this.toast.error(err?.message || "Erreur lors de l'envoi de l'image.");
      },
    });
  }

  // Rôles terrain
  updateGroundRole(index: number, field: keyof AboutGroundRole, value: string): void {
    this.content.update((c) => ({
      ...c,
      groundRoles: c.groundRoles.map((r, i) => (i === index ? { ...r, [field]: value } : r)),
    }));
  }

  addGroundRole(): void {
    this.content.update((c) => ({ ...c, groundRoles: [...c.groundRoles, emptyAboutGroundRole()] }));
  }

  removeGroundRole(index: number): void {
    this.content.update((c) => ({ ...c, groundRoles: c.groundRoles.filter((_, i) => i !== index) }));
  }

  // Engagements
  updateCommitment(index: number, field: keyof AboutCommitment, value: string): void {
    this.content.update((c) => ({
      ...c,
      commitments: c.commitments.map((cm, i) => (i === index ? { ...cm, [field]: value } : cm)),
    }));
  }

  addCommitment(): void {
    this.content.update((c) => ({ ...c, commitments: [...c.commitments, emptyAboutCommitment()] }));
  }

  removeCommitment(index: number): void {
    this.content.update((c) => ({ ...c, commitments: c.commitments.filter((_, i) => i !== index) }));
  }

  // Photos du carrousel "Nos équipes terrain"
  onGroundImageSelected(event: Event): void {
    const file = this.pickFile(event);
    if (!file) return;
    this.uploadingField.set('ground-gallery');
    this.cloudinary.upload(file, 'about-page/ground').subscribe({
      next: (res) => {
        this.content.update((c) => ({ ...c, groundImages: [...c.groundImages, res.secure_url] }));
        this.uploadingField.set(null);
      },
      error: (err: Error) => {
        this.uploadingField.set(null);
        this.toast.error(err?.message || "Erreur lors de l'envoi de l'image.");
      },
    });
  }

  removeGroundImage(index: number): void {
    this.content.update((c) => ({ ...c, groundImages: c.groundImages.filter((_, i) => i !== index) }));
  }

  // Valeurs ("Ce qui nous engage")
  updateValue(index: number, field: keyof AboutValue, value: string): void {
    this.content.update((c) => ({
      ...c,
      values: c.values.map((v, i) => (i === index ? { ...v, [field]: value } : v)),
    }));
  }

  addValue(): void {
    this.content.update((c) => ({ ...c, values: [...c.values, emptyAboutValue()] }));
  }

  removeValue(index: number): void {
    this.content.update((c) => ({ ...c, values: c.values.filter((_, i) => i !== index) }));
  }

  onValuesBackgroundSelected(event: Event): void {
    const file = this.pickFile(event);
    if (!file) return;
    this.uploadingField.set('values-bg');
    this.cloudinary.upload(file, 'about-page').subscribe({
      next: (res) => {
        this.update('valuesBackgroundImage', res.secure_url);
        this.uploadingField.set(null);
      },
      error: (err: Error) => {
        this.uploadingField.set(null);
        this.toast.error(err?.message || "Erreur lors de l'envoi de l'image.");
      },
    });
  }

  private pickFile(event: Event): File | null {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    return file;
  }

  save(): void {
    this.saving.set(true);
    this.aboutPageApi.update(this.content()).subscribe({
      next: (content) => {
        this.content.set(content);
        this.saving.set(false);
        this.toast.success('Contenu de la page À propos mis à jour.');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.toast.error(extractApiErrorMessage(err, "Erreur lors de l'enregistrement."));
      },
    });
  }
}
