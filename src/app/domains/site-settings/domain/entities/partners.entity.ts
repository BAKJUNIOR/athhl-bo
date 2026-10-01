/**
 * Bandeau "Nos partenaires" affiché au-dessus du footer sur la plupart des pages du site
 * vitrine (masqué sur /contact et /actualites). Jeu de données fixe (1 seul enregistrement,
 * avec une liste de logos) : un seul GET public, un seul PUT réservé ADMIN.
 */
export interface Partner {
  name: string;
  logo: string;
}

export interface PartnersSection {
  eyebrowFr: string;
  eyebrowEn: string;
  titleFr: string;
  titleEn: string;
  subtitleFr: string;
  subtitleEn: string;
  ctaLabelFr: string;
  ctaLabelEn: string;
  partners: Partner[];
}

export function emptyPartner(): Partner {
  return { name: '', logo: '' };
}

export const PARTNERS_SECTION_DEFAULTS: PartnersSection = {
  eyebrowFr: '',
  eyebrowEn: '',
  titleFr: '',
  titleEn: '',
  subtitleFr: '',
  subtitleEn: '',
  ctaLabelFr: '',
  ctaLabelEn: '',
  partners: [],
};
