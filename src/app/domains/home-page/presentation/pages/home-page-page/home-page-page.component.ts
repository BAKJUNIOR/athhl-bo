import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../../../dashboard/presentation/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../../dashboard/presentation/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { LabelComponent } from '../../../../dashboard/presentation/components/form/label/label.component';
import { InputFieldComponent } from '../../../../dashboard/presentation/components/form/input/input-field.component';
import { TextAreaComponent } from '../../../../dashboard/presentation/components/form/input/text-area.component';
import { HomePageApi } from '../../../infrastructure/api/home-page.api';
import { CloudinaryUploadService } from '../../../../../core/services/cloudinary-upload.service';
import { HomePageContent, emptyHomePageContent } from '../../../domain/entities/home-page.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';

type PillarKey = 'Construction' | 'Mobility' | 'Import';

@Component({
  selector: 'app-home-page-page',
  standalone: true,
  imports: [PageBreadcrumbComponent, ComponentCardComponent, ButtonComponent, LabelComponent, InputFieldComponent, TextAreaComponent],
  templateUrl: './home-page-page.component.html',
})
export class HomePagePageComponent {
  private readonly homePageApi = inject(HomePageApi);
  private readonly cloudinary = inject(CloudinaryUploadService);
  private readonly toast = inject(ToastService);

  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);
  uploadingField = signal<string | null>(null);

  content = signal<HomePageContent>(emptyHomePageContent());

  readonly pillars: { key: PillarKey; label: string }[] = [
    { key: 'Construction', label: 'Construction & rénovation' },
    { key: 'Mobility', label: 'Mobilité, VTC & Livraison' },
    { key: 'Import', label: 'Import & logistique' },
  ];

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.homePageApi.get().subscribe({
      next: (content) => {
        this.content.set(content ?? emptyHomePageContent());
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(extractApiErrorMessage(err, 'Erreur lors du chargement du contenu.'));
        this.loading.set(false);
      },
    });
  }

  update<K extends keyof HomePageContent>(field: K, value: HomePageContent[K]): void {
    this.content.update((c) => ({ ...c, [field]: value }));
  }

  pillarLeadFr(key: PillarKey): string {
    return this.content()[`pillar${key}LeadFr` as const];
  }
  pillarLeadEn(key: PillarKey): string {
    return this.content()[`pillar${key}LeadEn` as const];
  }
  pillarImage(key: PillarKey): string {
    return this.content()[`pillar${key}Image` as const];
  }

  updatePillarLeadFr(key: PillarKey, value: string): void {
    this.update(`pillar${key}LeadFr` as const, value);
  }
  updatePillarLeadEn(key: PillarKey, value: string): void {
    this.update(`pillar${key}LeadEn` as const, value);
  }

  onPillarImageSelected(event: Event, key: PillarKey): void {
    const file = this.pickFile(event);
    if (!file) return;
    const uploadKey = `pillar-${key}`;
    this.uploadingField.set(uploadKey);
    this.cloudinary.upload(file, 'home-page/pillars').subscribe({
      next: (res) => {
        this.update(`pillar${key}Image` as const, res.secure_url);
        this.uploadingField.set(null);
      },
      error: (err: Error) => {
        this.uploadingField.set(null);
        this.toast.error(err?.message || "Erreur lors de l'envoi de l'image.");
      },
    });
  }

  // Galerie d'images de fond du bandeau (défilement en rotation côté front)
  removeHeroImage(index: number): void {
    this.content.update((c) => ({ ...c, heroImages: c.heroImages.filter((_, i) => i !== index) }));
  }

  onHeroImageSelected(event: Event): void {
    const file = this.pickFile(event);
    if (!file) return;
    this.uploadingField.set('hero-images');
    this.cloudinary.upload(file, 'home-page/hero').subscribe({
      next: (res) => {
        this.content.update((c) => ({ ...c, heroImages: [...c.heroImages, res.secure_url] }));
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
    this.homePageApi.update(this.content()).subscribe({
      next: (content) => {
        this.content.set(content);
        this.saving.set(false);
        this.toast.success("Contenu de la page d'accueil mis à jour.");
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.toast.error(extractApiErrorMessage(err, "Erreur lors de l'enregistrement."));
      },
    });
  }
}
