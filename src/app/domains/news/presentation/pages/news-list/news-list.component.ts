import { Component, computed, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse } from '@angular/common/http';
import { Observable } from 'rxjs';
import { Router, RouterModule } from '@angular/router';
import { PageBreadcrumbComponent } from '../../../../dashboard/presentation/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../../dashboard/presentation/components/common/component-card/component-card.component';
import { BadgeComponent } from '../../../../../shared/ui/badge/badge.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { ModalComponent } from '../../../../../shared/ui/modal/modal.component';
import { DropdownComponent } from '../../../../../shared/ui/dropdown/dropdown.component';
import { DropdownItemComponent } from '../../../../../shared/ui/dropdown/dropdown-item/dropdown-item.component';
import { SelectComponent, Option } from '../../../../dashboard/presentation/components/form/select/select.component';
import { NewsApi } from '../../../infrastructure/api/news.api';
import { NewsArticle, newsStatusLabel } from '../../../domain/entities/news.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';

type ConfirmType = 'publish' | 'unpublish' | 'delete';

interface ConfirmState {
  type: ConfirmType;
  article: NewsArticle;
  title: string;
  description: string;
  confirmLabel: string;
  danger: boolean;
}

@Component({
  selector: 'app-news-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    PageBreadcrumbComponent,
    ComponentCardComponent,
    BadgeComponent,
    ButtonComponent,
    ModalComponent,
    DropdownComponent,
    DropdownItemComponent,
    SelectComponent,
  ],
  templateUrl: './news-list.component.html',
})
export class NewsListComponent {
  private readonly router = inject(Router);
  private readonly newsApi = inject(NewsApi);
  private readonly toast = inject(ToastService);

  articles = signal<NewsArticle[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  search = signal('');
  statusFilter = signal<'' | 'draft' | 'published'>('');
  filtersOpen = signal(false);

  readonly statusFilterOptions: Option[] = [
    { value: '', label: 'Tous les statuts' },
    { value: 'published', label: 'Publié' },
    { value: 'draft', label: 'Brouillon' },
  ];

  filteredArticles = computed(() => {
    const q = this.search().trim().toLowerCase();
    const status = this.statusFilter();
    return this.articles().filter((a) => {
      const matchesQuery = !q || a.titleFr.toLowerCase().includes(q);
      const matchesStatus = !status || a.status === status;
      return matchesQuery && matchesStatus;
    });
  });

  statusLabel = newsStatusLabel;

  openMenuId = signal<number | null>(null);

  // ── Confirmation (publier / dépublier / supprimer) ──
  confirm = signal<ConfirmState | null>(null);
  confirming = signal(false);

  constructor() {
    this.loadArticles();
  }

  loadArticles(): void {
    this.loading.set(true);
    this.error.set(null);
    this.newsApi.list().subscribe({
      next: (list) => {
        this.articles.set(list ?? []);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(extractApiErrorMessage(err, 'Erreur lors du chargement des actualités.'));
        this.loading.set(false);
      },
    });
  }

  toggleFilters(): void {
    this.filtersOpen.update((v) => !v);
  }

  toggleMenu(id: number): void {
    this.openMenuId.set(this.openMenuId() === id ? null : id);
  }

  closeMenu(): void {
    this.openMenuId.set(null);
  }

  openCreate(): void {
    this.router.navigateByUrl('/news/new');
  }

  openEdit(article: NewsArticle): void {
    this.closeMenu();
    this.router.navigateByUrl(`/news/${article.id}/edit`);
  }

  askPublish(a: NewsArticle): void {
    this.closeMenu();
    this.confirm.set({
      type: 'publish', article: a,
      title: 'Publier cette actualité ?',
      description: `« ${a.titleFr} » deviendra visible sur la page Actualités du site.`,
      confirmLabel: 'Publier', danger: false,
    });
  }

  askUnpublish(a: NewsArticle): void {
    this.closeMenu();
    this.confirm.set({
      type: 'unpublish', article: a,
      title: 'Dépublier cette actualité ?',
      description: `« ${a.titleFr} » ne sera plus visible sur le site.`,
      confirmLabel: 'Dépublier', danger: false,
    });
  }

  askDelete(a: NewsArticle): void {
    this.closeMenu();
    this.confirm.set({
      type: 'delete', article: a,
      title: 'Supprimer cette actualité ?',
      description: `« ${a.titleFr} » sera définitivement supprimée.`,
      confirmLabel: 'Supprimer', danger: true,
    });
  }

  cancelConfirm(): void {
    if (this.confirming()) return;
    this.confirm.set(null);
  }

  runConfirm(): void {
    const c = this.confirm();
    if (!c) return;
    this.confirming.set(true);

    const request$: Observable<unknown> =
      c.type === 'publish' ? this.newsApi.publish(c.article.id)
        : c.type === 'unpublish' ? this.newsApi.unpublish(c.article.id)
        : this.newsApi.delete(c.article.id);

    request$.subscribe({
      next: () => {
        this.confirming.set(false);
        this.confirm.set(null);
        this.toast.success(c.type === 'delete' ? 'Actualité supprimée.' : c.type === 'publish' ? 'Actualité publiée.' : 'Actualité dépubliée.');
        this.loadArticles();
      },
      error: (err: HttpErrorResponse) => {
        this.confirming.set(false);
        this.toast.error(extractApiErrorMessage(err, "Erreur lors de l'opération."));
      },
    });
  }
}
