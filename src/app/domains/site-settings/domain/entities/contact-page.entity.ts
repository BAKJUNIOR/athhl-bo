/**
 * Contenu propre à la page /contact du site vitrine : textes des en-têtes et des cartes
 * d'information. Les coordonnées elles-mêmes (téléphones, adresse, email, réseaux) restent
 * sur SiteContact, partagées avec le footer — voir site-contact.entity.ts.
 * Jeu de données fixe (1 seul enregistrement) : un seul GET public, un seul PUT réservé ADMIN.
 */
export interface ContactPageContent {
  heroEyebrowFr: string;
  heroEyebrowEn: string;
  heroTitleFr: string;
  heroTitleEn: string;
  heroSubtitleFr: string;
  heroSubtitleEn: string;

  writeToUsEyebrowFr: string;
  writeToUsEyebrowEn: string;

  infoEyebrowFr: string;
  infoEyebrowEn: string;
  infoHeadingFr: string;
  infoHeadingEn: string;

  phoneTitleFr: string;
  phoneTitleEn: string;
  phoneNoteFr: string;
  phoneNoteEn: string;

  emailTitleFr: string;
  emailTitleEn: string;

  addressTitleFr: string;
  addressTitleEn: string;
  addressNoteFr: string;
  addressNoteEn: string;
}

export const CONTACT_PAGE_DEFAULTS: ContactPageContent = {
  heroEyebrowFr: '',
  heroEyebrowEn: '',
  heroTitleFr: '',
  heroTitleEn: '',
  heroSubtitleFr: '',
  heroSubtitleEn: '',

  writeToUsEyebrowFr: '',
  writeToUsEyebrowEn: '',

  infoEyebrowFr: '',
  infoEyebrowEn: '',
  infoHeadingFr: '',
  infoHeadingEn: '',

  phoneTitleFr: '',
  phoneTitleEn: '',
  phoneNoteFr: '',
  phoneNoteEn: '',

  emailTitleFr: '',
  emailTitleEn: '',

  addressTitleFr: '',
  addressTitleEn: '',
  addressNoteFr: '',
  addressNoteEn: '',
};
