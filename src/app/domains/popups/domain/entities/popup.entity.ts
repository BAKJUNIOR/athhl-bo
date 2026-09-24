export type PopupType = 'image' | 'image_text' | 'video';
export type PopupLayout = 'stacked' | 'image_left';
export type PopupFrequency = 'once_per_visitor' | 'every_visit';

/**
 * Reprend exactement les champs attendus par `Popup` côté Athl_logistics-front
 * (domains/vitrine/domain/popup.entity.ts) : le front lit "y a-t-il une popup active
 * pour cette page ?" et l'affiche telle quelle, sans aucun choix laissé au visiteur.
 * `page` cible une page précise du site vitrine, `active` pilote sa visibilité (peut être
 * coupée sans être supprimée), `type`/`layout` déterminent la mise en forme (image seule,
 * image+texte en pile ou disposée image à gauche/texte à droite, ou vidéo).
 *
 * Règle métier à faire respecter par le backend une fois branché : une seule popup active
 * par page à la fois. À l'activation d'une popup sur une page qui en a déjà une active,
 * l'ancienne doit être désactivée automatiquement (le front, lui, sait déjà encaisser le cas
 * où la règle ne serait pas respectée, en affichant la plus récemment mise à jour).
 */
export interface Popup {
  id: number;
  page: string;
  active: boolean;
  type: PopupType;
  layout: PopupLayout;
  frequency: PopupFrequency;
  /** Délai avant apparition, en millisecondes. */
  delayMs: number;
  eyebrow?: string;
  title: string;
  text?: string;
  image?: string;
  video?: string;
  /** Affiche un champ e-mail + bouton d'inscription (cas "récolter les mails pour la newsletter"). */
  collectEmail: boolean;
  ctaLabel?: string;
  ctaUrl?: string;
  updatedAt: string;
}

export type PopupUpsertRequest = Omit<Popup, 'id' | 'updatedAt'>;

/** Pages du site vitrine sur lesquelles une popup peut être ciblée (voir Athl_logistics-front app.routes). */
export const POPUP_PAGE_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'Accueil' },
  { value: 'a-propos', label: 'À propos' },
  { value: 'equipe', label: 'Équipe' },
  { value: 'services', label: 'Services' },
  { value: 'projets', label: 'Projets' },
  { value: 'carrieres', label: 'Carrières' },
  { value: 'contact', label: 'Contact' },
  { value: 'devis', label: 'Devis' },
];

export function popupPageLabel(page: string): string {
  return POPUP_PAGE_OPTIONS.find((p) => p.value === page)?.label ?? page;
}

export function popupTypeLabel(type: PopupType): string {
  switch (type) {
    case 'image':
      return 'Image seule';
    case 'image_text':
      return 'Image + texte';
    case 'video':
      return 'Vidéo';
  }
}

export function popupLayoutLabel(layout: PopupLayout): string {
  return layout === 'image_left' ? 'Image à gauche / texte à droite' : 'Image au-dessus du texte';
}

export function popupFrequencyLabel(frequency: PopupFrequency): string {
  return frequency === 'once_per_visitor' ? '1ère visite seulement' : 'À chaque visite';
}

export function emptyPopupForm(): PopupUpsertRequest {
  return {
    page: '',
    active: false,
    type: 'image_text',
    layout: 'stacked',
    frequency: 'once_per_visitor',
    delayMs: 1200,
    eyebrow: '',
    title: '',
    text: '',
    image: '',
    video: '',
    collectEmail: false,
    ctaLabel: '',
    ctaUrl: '',
  };
}
