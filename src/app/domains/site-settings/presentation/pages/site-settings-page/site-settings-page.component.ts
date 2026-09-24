import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { forkJoin } from 'rxjs';
import { PageBreadcrumbComponent } from '../../../../dashboard/presentation/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../../dashboard/presentation/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { LabelComponent } from '../../../../dashboard/presentation/components/form/label/label.component';
import { InputFieldComponent } from '../../../../dashboard/presentation/components/form/input/input-field.component';
import { HomeStatsApi } from '../../../infrastructure/api/home-stats.api';
import { SiteContactApi } from '../../../infrastructure/api/site-contact.api';
import { HOME_STAT_DEFAULTS, HomeStat } from '../../../domain/entities/home-stat.entity';
import { SITE_CONTACT_DEFAULTS, SiteContact } from '../../../domain/entities/site-contact.entity';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';

@Component({
  selector: 'app-site-settings-page',
  standalone: true,
  imports: [
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    LabelComponent,
    InputFieldComponent,
  ],
  templateUrl: './site-settings-page.component.html',
})
export class SiteSettingsPageComponent {
  private readonly homeStatsApi = inject(HomeStatsApi);
  private readonly siteContactApi = inject(SiteContactApi);
  private readonly toast = inject(ToastService);

  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);

  stats = signal<HomeStat[]>(HOME_STAT_DEFAULTS);
  contact = signal<SiteContact>(SITE_CONTACT_DEFAULTS);

  constructor() {
    this.load();
  }

  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      stats: this.homeStatsApi.list(),
      contact: this.siteContactApi.get(),
    }).subscribe({
      next: ({ stats, contact }) => {
        this.stats.set(stats?.length ? stats : HOME_STAT_DEFAULTS);
        this.contact.set(contact ?? SITE_CONTACT_DEFAULTS);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(extractApiErrorMessage(err, 'Erreur lors du chargement des paramètres.'));
        this.loading.set(false);
      },
    });
  }

  updateStat(index: number, field: 'value' | 'decimals' | 'suffix', value: number | string): void {
    this.stats.update((list) =>
      list.map((s, i) => (i === index ? { ...s, [field]: value } : s))
    );
  }

  updateContact<K extends keyof SiteContact>(field: K, value: SiteContact[K]): void {
    this.contact.update((c) => ({ ...c, [field]: value }));
  }

  save(): void {
    this.saving.set(true);
    forkJoin({
      stats: this.homeStatsApi.update(this.stats()),
      contact: this.siteContactApi.update(this.contact()),
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Paramètres du site mis à jour.');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.toast.error(
          extractApiErrorMessage(err, "Erreur lors de l'enregistrement : l'API backend correspondante n'existe pas encore.")
        );
      },
    });
  }
}
