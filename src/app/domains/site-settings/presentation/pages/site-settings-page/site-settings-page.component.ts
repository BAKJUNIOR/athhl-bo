import { Component, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, forkJoin, of } from 'rxjs';
import { PageBreadcrumbComponent } from '../../../../dashboard/presentation/components/common/page-breadcrumb/page-breadcrumb.component';
import { ComponentCardComponent } from '../../../../dashboard/presentation/components/common/component-card/component-card.component';
import { ButtonComponent } from '../../../../../shared/ui/button/button.component';
import { LabelComponent } from '../../../../dashboard/presentation/components/form/label/label.component';
import { InputFieldComponent } from '../../../../dashboard/presentation/components/form/input/input-field.component';
import { TextAreaComponent } from '../../../../dashboard/presentation/components/form/input/text-area.component';
import { SiteContactApi } from '../../../infrastructure/api/site-contact.api';
import { PartnersApi } from '../../../infrastructure/api/partners.api';
import { ContactPageApi } from '../../../infrastructure/api/contact-page.api';
import { SITE_CONTACT_DEFAULTS, SiteContact } from '../../../domain/entities/site-contact.entity';
import { PARTNERS_SECTION_DEFAULTS, PartnersSection, emptyPartner } from '../../../domain/entities/partners.entity';
import { CONTACT_PAGE_DEFAULTS, ContactPageContent } from '../../../domain/entities/contact-page.entity';
import { CloudinaryUploadService } from '../../../../../core/services/cloudinary-upload.service';
import { ToastService } from '../../../../../core/services/toast.service';
import { extractApiErrorMessage } from '../../../../../core/utils/api-error.util';

type SettingsSection = 'general' | 'partners' | 'footer' | 'contactPage';

const SETTINGS_SECTIONS: { key: SettingsSection; label: string }[] = [
  { key: 'general', label: 'Coordonnées' },
  { key: 'partners', label: 'Partenaires' },
  { key: 'footer', label: 'Footer' },
  { key: 'contactPage', label: 'Page Contact' },
];

@Component({
  selector: 'app-site-settings-page',
  standalone: true,
  imports: [
    PageBreadcrumbComponent,
    ComponentCardComponent,
    ButtonComponent,
    LabelComponent,
    InputFieldComponent,
    TextAreaComponent,
  ],
  templateUrl: './site-settings-page.component.html',
})
export class SiteSettingsPageComponent {
  private readonly siteContactApi = inject(SiteContactApi);
  private readonly partnersApi = inject(PartnersApi);
  private readonly contactPageApi = inject(ContactPageApi);
  private readonly cloudinary = inject(CloudinaryUploadService);
  private readonly toast = inject(ToastService);

  loading = signal(true);
  error = signal<string | null>(null);
  saving = signal(false);
  uploadingField = signal<string | null>(null);

  readonly sections = SETTINGS_SECTIONS;
  activeSection = signal<SettingsSection>('general');

  contact = signal<SiteContact>(SITE_CONTACT_DEFAULTS);
  partners = signal<PartnersSection>(PARTNERS_SECTION_DEFAULTS);
  contactPage = signal<ContactPageContent>(CONTACT_PAGE_DEFAULTS);

  constructor() {
    this.load();
  }

  // Chaque ressource est chargée indépendamment (repli sur ses valeurs par défaut en cas
  // d'erreur) : si l'une d'elles n'existe pas encore en base (ex: coordonnées du site, voir
  // conversation), les autres onglets restent utilisables plutôt que de bloquer toute la page.
  load(): void {
    this.loading.set(true);
    this.error.set(null);
    forkJoin({
      contact: this.siteContactApi.get().pipe(catchError(() => of(SITE_CONTACT_DEFAULTS))),
      partners: this.partnersApi.get().pipe(catchError(() => of(PARTNERS_SECTION_DEFAULTS))),
      contactPage: this.contactPageApi.get().pipe(catchError(() => of(CONTACT_PAGE_DEFAULTS))),
    }).subscribe({
      next: ({ contact, partners, contactPage }) => {
        this.contact.set(contact ?? SITE_CONTACT_DEFAULTS);
        this.partners.set(partners ?? PARTNERS_SECTION_DEFAULTS);
        this.contactPage.set(contactPage ?? CONTACT_PAGE_DEFAULTS);
        this.loading.set(false);
      },
      error: (err: HttpErrorResponse) => {
        this.error.set(extractApiErrorMessage(err, 'Erreur lors du chargement des paramètres.'));
        this.loading.set(false);
      },
    });
  }

  updateContact<K extends keyof SiteContact>(field: K, value: SiteContact[K]): void {
    this.contact.update((c) => ({ ...c, [field]: value }));
  }

  updatePartnersSection<K extends keyof PartnersSection>(field: K, value: PartnersSection[K]): void {
    this.partners.update((p) => ({ ...p, [field]: value }));
  }

  updatePartner(index: number, field: 'name' | 'logo', value: string): void {
    this.partners.update((p) => ({
      ...p,
      partners: p.partners.map((partner, i) => (i === index ? { ...partner, [field]: value } : partner)),
    }));
  }

  addPartner(): void {
    this.partners.update((p) => ({ ...p, partners: [...p.partners, emptyPartner()] }));
  }

  removePartner(index: number): void {
    this.partners.update((p) => ({ ...p, partners: p.partners.filter((_, i) => i !== index) }));
  }

  onPartnerLogoSelected(event: Event, index: number): void {
    const file = this.pickFile(event);
    if (!file) return;
    this.uploadingField.set('partner-logo-' + index);
    this.cloudinary.upload(file, 'partners').subscribe({
      next: (res) => {
        this.updatePartner(index, 'logo', res.secure_url);
        this.uploadingField.set(null);
      },
      error: (err: Error) => {
        this.uploadingField.set(null);
        this.toast.error(err?.message || "Erreur lors de l'envoi du logo.");
      },
    });
  }

  private pickFile(event: Event): File | null {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0] ?? null;
    input.value = '';
    return file;
  }

  updateContactPage<K extends keyof ContactPageContent>(field: K, value: ContactPageContent[K]): void {
    this.contactPage.update((c) => ({ ...c, [field]: value }));
  }

  save(): void {
    this.saving.set(true);
    forkJoin({
      contact: this.siteContactApi.update(this.contact()),
      partners: this.partnersApi.update(this.partners()),
      contactPage: this.contactPageApi.update(this.contactPage()),
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.toast.success('Paramètres du site mis à jour.');
      },
      error: (err: HttpErrorResponse) => {
        this.saving.set(false);
        this.toast.error(extractApiErrorMessage(err, "Erreur lors de l'enregistrement."));
      },
    });
  }
}
