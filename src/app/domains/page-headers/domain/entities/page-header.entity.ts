/**
 * En-tête (surtitre, titre, texte d'introduction) d'une page de liste du site vitrine.
 * Miroir de PageHeaderDTO côté backend. Un champ vide = le site affiche son texte par défaut.
 */
export interface PageHeader {
  pageKey: string;
  eyebrowFr: string | null;
  eyebrowEn: string | null;
  titleFr: string | null;
  titleEn: string | null;
  subtitleFr: string | null;
  subtitleEn: string | null;
}

/** Pages concernées, dans l'ordre d'affichage (mêmes clés que PageHeaderServiceImpl.PAGE_KEYS). */
export const PAGE_HEADER_PAGES: { key: string; label: string; url: string }[] = [
  { key: 'services', label: 'Services', url: '/services' },
  { key: 'projects', label: 'Réalisations / Projets', url: '/projets' },
  { key: 'news', label: 'Actualités', url: '/actualites' },
  { key: 'team', label: 'Équipe', url: '/equipe' },
  { key: 'careers', label: 'Carrières', url: '/carrieres' },
  { key: 'quote', label: 'Demande de devis', url: '/devis' },
  { key: 'search', label: 'Recherche', url: '/recherche' },
];

export function emptyPageHeader(pageKey: string): PageHeader {
  return { pageKey, eyebrowFr: '', eyebrowEn: '', titleFr: '', titleEn: '', subtitleFr: '', subtitleEn: '' };
}
