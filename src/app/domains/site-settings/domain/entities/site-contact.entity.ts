/**
 * Coordonnées et réseaux sociaux affichés sur le site vitrine (footer + page Contact) :
 * 3 numéros de téléphone, l'adresse, l'email de contact, le lieu de la carte Google Maps,
 * les liens sociaux et le petit texte "À propos d'ATHL" du footer. Jeu de données fixe
 * (1 seul enregistrement) : un seul GET, un seul PUT global.
 */
export interface SiteContact {
  phone1: string;
  phone2: string;
  phone3: string;
  address: string;
  facebookUrl: string;
  youtubeUrl: string;
  instagramUrl: string;
  linkedinUrl: string;
  tiktokUrl: string;
  contactEmail: string;
  footerAboutFr: string;
  footerAboutEn: string;
  mapLocation: string;
}

export const SITE_CONTACT_DEFAULTS: SiteContact = {
  phone1: '+225 07 78 09 58 58',
  phone2: '+225 07 09 99 33 47',
  phone3: '+225 07 58 60 16 27',
  address: "Abidjan, Côte d'Ivoire",
  facebookUrl: '',
  youtubeUrl: '',
  instagramUrl: '',
  linkedinUrl: '',
  tiktokUrl: '',
  contactEmail: '',
  footerAboutFr: '',
  footerAboutEn: '',
  mapLocation: '',
};
