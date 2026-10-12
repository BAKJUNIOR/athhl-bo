// Bloc repliable « En-tête de la page » posé en haut des écrans du BO qui gèrent le contenu d'une
// page de liste du site (Services, Projets, Actualités…) : surtitre, titre et texte d'introduction
// de cette page, enregistrés indépendamment du reste de l'écran (voir PageHeader côté backend).
import { Component, Input, OnInit, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { LabelComponent } from '../../../../dashboard/presentation/components/form/label/label.component';
import { InputFieldComponent } from '../../../../dashboard/presentation/components/form/input/input-field.component';
import { TextAreaComponent } from '../../../../dashboard/presentation/components/form/input/text-area.component';
import { PageHeaderApi } from '../../../infrastructure/api/page-header.api';
import { PAGE_HEADER_PAGES, PageHeader, emptyPageHeader } from '../../../domain/entities/page-header.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';

type TextField = Exclude<keyof PageHeader, 'pageKey'>;

@Component({
  selector: 'app-page-header-editor',
  imports: [ButtonComponent, LabelComponent, InputFieldComponent, TextAreaComponent],
  templateUrl: './page-header-editor.component.html',
})
export class PageHeaderEditorComponent implements OnInit {
  private readonly pageHeaderApi = inject(PageHeaderApi);
  private readonly toast = inject(ToastService);

  /** Clé de la page du site (voir PAGE_HEADER_PAGES) : 'services', 'projects', 'news'… */
  @Input({ required: true }) pageKey!: string;

  open = signal(false);
  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);

  header = signal<PageHeader>(emptyPageHeader(''));
  // Dernière version enregistrée : sert au résumé replié et au bouton Annuler.
  private saved = signal<PageHeader>(emptyPageHeader(''));

  readonly summary = computed(() => {
    const s = this.saved();
    return [s.eyebrowFr, s.titleFr].filter((v) => !!v?.trim()).join(' · ') || 'Texte par défaut du site';
  });

  get pageUrl(): string {
    return PAGE_HEADER_PAGES.find((p) => p.key === this.pageKey)?.url ?? '';
  }

  ngOnInit(): void {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.pageHeaderApi.list().subscribe({
      next: (list) => {
        this.apply((list ?? []).find((h) => h.pageKey === this.pageKey) ?? emptyPageHeader(this.pageKey));
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(extractApiErrorMessage(err, "Erreur lors du chargement de l'en-tête."));
        this.loading.set(false);
      },
    });
  }

  update(field: TextField, value: string): void {
    this.header.update((h) => ({ ...h, [field]: value }));
  }

  cancel(): void {
    this.header.set(this.saved());
    this.open.set(false);
  }

  save(): void {
    this.saving.set(true);
    this.pageHeaderApi.update([this.header()]).subscribe({
      next: (list) => {
        this.apply((list ?? []).find((h) => h.pageKey === this.pageKey) ?? this.header());
        this.saving.set(false);
        this.open.set(false);
        this.toast.success("En-tête de la page mis à jour.");
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.toast.error(extractApiErrorMessage(err, "Erreur lors de l'enregistrement de l'en-tête."));
      },
    });
  }

  private apply(header: PageHeader): void {
    this.header.set(header);
    this.saved.set(header);
  }
}
