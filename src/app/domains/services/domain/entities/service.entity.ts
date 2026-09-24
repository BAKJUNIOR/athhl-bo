export type ServiceStatus = 'draft' | 'published';

export interface ServicePrestation {
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
}

export interface ServiceProcessStep {
  number: string;
  titleFr: string;
  titleEn: string;
  descriptionFr: string;
  descriptionEn: string;
}

/**
 * Reprend les champs attendus par `Service` côté Athl_logistics-front
 * (domains/vitrine/domain/service.entity.ts), avec les textes dupliqués par langue
 * (titleFr/titleEn...) au lieu des deux tableaux SERVICES_FR/SERVICES_EN du front :
 * un seul enregistrement à éditer ici, le front choisit le bon champ selon sa langue
 * active. `status` pilote la visibilité publique — le site ne doit afficher que les
 * services `published` (un `draft` reste visible et modifiable uniquement dans le BO).
 */
export interface Service {
  id: number;
  slug: string;
  number: string;
  titleFr: string;
  titleEn: string;
  shortTitleFr: string;
  shortTitleEn: string;
  leadFr: string;
  leadEn: string;
  image: string;
  heroImage: string;
  gallery: string[];
  prestations: ServicePrestation[];
  process: ServiceProcessStep[];
  status: ServiceStatus;
  updatedAt: string;
}

// Le slug est généré une seule fois par le backend à la création (voir Athl_logistics-backend,
// ServiceOfferingServiceImpl) et reste ensuite immuable : le BO ne l'édite jamais, il l'affiche
// seulement (liste, aperçu). C'est pourquoi il est exclu du payload créer/modifier.
export type ServiceUpsertRequest = Omit<Service, 'id' | 'slug' | 'updatedAt'>;

export function serviceStatusLabel(status: ServiceStatus): string {
  return status === 'published' ? 'Publié' : 'Brouillon';
}

export function emptyPrestation(): ServicePrestation {
  return { titleFr: '', titleEn: '', descriptionFr: '', descriptionEn: '' };
}

export function emptyProcessStep(order: number): ServiceProcessStep {
  return {
    number: String(order).padStart(2, '0'),
    titleFr: '',
    titleEn: '',
    descriptionFr: '',
    descriptionEn: '',
  };
}

export function emptyServiceForm(): ServiceUpsertRequest {
  return {
    number: '01',
    titleFr: '',
    titleEn: '',
    shortTitleFr: '',
    shortTitleEn: '',
    leadFr: '',
    leadEn: '',
    image: '',
    heroImage: '',
    gallery: [],
    prestations: [emptyPrestation()],
    process: [emptyProcessStep(1)],
    status: 'draft',
  };
}
