import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { PageBreadcrumbComponent } from '../../../../dashboard/presentation/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../../dashboard/presentation/components/common/component-card/component-card.component';
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
  selector: 'app-page-headers-page',
  standalone: true,
  imports: [PageBreadcrumbComponent, ComponentCardComponent, ButtonComponent, LabelComponent, InputFieldComponent, TextAreaComponent],
  templateUrl: './page-headers-page.component.html',
})
export class PageHeadersPageComponent {
  private readonly pageHeaderApi = inject(PageHeaderApi);
  private readonly toast = inject(ToastService);

  readonly pages = PAGE_HEADER_PAGES;

  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);

  // Toujours une entrée par page connue, même si le backend n'a pas encore de ligne pour elle.
  headers = signal<PageHeader[]>(this.withAllPages([]));

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    this.pageHeaderApi.list().subscribe({
      next: (list) => {
        this.headers.set(this.withAllPages(list ?? []));
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(extractApiErrorMessage(err, 'Erreur lors du chargement des en-têtes.'));
        this.loading.set(false);
      },
    });
  }

  header(pageKey: string): PageHeader {
    return this.headers().find((h) => h.pageKey === pageKey) ?? emptyPageHeader(pageKey);
  }

  update(pageKey: string, field: TextField, value: string): void {
    this.headers.update((list) => list.map((h) => (h.pageKey === pageKey ? { ...h, [field]: value } : h)));
  }

  save(): void {
    this.saving.set(true);
    this.pageHeaderApi.update(this.headers()).subscribe({
      next: (list) => {
        this.headers.set(this.withAllPages(list ?? []));
        this.saving.set(false);
        this.toast.success('En-têtes des pages mis à jour.');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.toast.error(extractApiErrorMessage(err, "Erreur lors de l'enregistrement."));
      },
    });
  }

  private withAllPages(list: PageHeader[]): PageHeader[] {
    return PAGE_HEADER_PAGES.map((p) => list.find((h) => h.pageKey === p.key) ?? emptyPageHeader(p.key));
  }
}
