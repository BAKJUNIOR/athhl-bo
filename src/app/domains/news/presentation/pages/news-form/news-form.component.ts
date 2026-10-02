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
import { NewsApi } from '../../../infrastructure/api/news.api';
import { CloudinaryUploadService } from '../../../../../core/services/cloudinary-upload.service';
import { NewsUpsertRequest, emptyNewsForm, newsStatusLabel } from '../../../domain/entities/news.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';

@Component({
  selector: 'app-news-form',
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
  ],
  templateUrl: './news-form.component.html',
})
export class NewsFormComponent {
  private readonly route = inject(ActivatedRoute);
  private readonly router = inject(Router);
  private readonly newsApi = inject(NewsApi);
  private readonly cloudinary = inject(CloudinaryUploadService);
  private readonly toast = inject(ToastService);

  readonly newsId = this.resolveId();
  readonly isEdit = this.newsId !== null;

  loading = signal(this.isEdit);
  loadError = signal<string | null>(null);

  saving = signal(false);
  formError = signal<string | null>(null);
  submitAttempted = signal(false);
  uploadingImage = signal(false);

  form = signal<NewsUpsertRequest>(emptyNewsForm());
  // Généré par le backend à la création, affiché ici en lecture seule (voir news.entity.ts).
  currentSlug = signal<string | null>(null);

  statusLabel = newsStatusLabel;

  constructor() {
    if (this.isEdit) {
      this.loadArticle();
    }
  }

  private resolveId(): number | null {
    const raw = this.route.snapshot.paramMap.get('id');
    if (!raw) return null;
    const id = Number(raw);
    return Number.isFinite(id) ? id : null;
  }

  private loadArticle(): void {
    this.loading.set(true);
    this.loadError.set(null);
    this.newsApi.getById(this.newsId!).subscribe({
      next: (article) => {
        const { id, updatedAt, slug, ...rest } = article;
        this.form.set(rest);
        this.currentSlug.set(slug);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.loadError.set(extractApiErrorMessage(err, 'Impossible de charger cette actualité.'));
        this.loading.set(false);
      },
    });
  }

  cancel(): void {
    if (this.saving()) return;
    this.router.navigateByUrl('/news');
  }

  updateForm<K extends keyof NewsUpsertRequest>(field: K, value: NewsUpsertRequest[K]): void {
    this.form.update((f) => ({ ...f, [field]: value }));
  }

  onStatusChange(published: boolean): void {
    this.updateForm('status', published ? 'published' : 'draft');
  }

  // Upload d'image (Cloudinary)
  onImageSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;

    this.uploadingImage.set(true);
    this.cloudinary.upload(file, 'news').subscribe({
      next: (res) => {
        this.updateForm('image', res.secure_url);
        this.uploadingImage.set(false);
      },
      error: (err: Error) => {
        this.uploadingImage.set(false);
        this.toast.error(err?.message || "Erreur lors de l'envoi de l'image.");
      },
    });
  }

  get titleFrMissing(): boolean {
    return this.submitAttempted() && !this.form().titleFr.trim();
  }

  get dateMissing(): boolean {
    return this.submitAttempted() && !this.form().date;
  }

  submitForm(): void {
    this.submitAttempted.set(true);
    const f = this.form();
    if (!f.titleFr.trim() || !f.date) {
      this.formError.set('Le titre (FR) et la date sont obligatoires.');
      return;
    }
    this.formError.set(null);
    this.saving.set(true);

    const id = this.newsId;
    const request$ = id ? this.newsApi.update(id, f) : this.newsApi.create(f);

    request$.subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success(id ? 'Actualité mise à jour.' : 'Actualité créée.');
        this.router.navigateByUrl('/news');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.formError.set(extractApiErrorMessage(err, "Erreur lors de l'enregistrement."));
      },
    });
  }
}
