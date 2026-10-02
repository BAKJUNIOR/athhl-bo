export type ProjectStatus = 'draft' | 'published';

export function projectStatusLabel(status: ProjectStatus): string {
  return status === 'published' ? 'Publié' : 'Brouillon';
}

/**
 * Reprend les champs attendus par `Project` côté Athl_logistics-front
 * (domains/vitrine/infrastructure/data/projects.data.ts). Chaque projet appartient à un métier
 * (serviceId/serviceSlug) — la page /projets du site groupe les projets par métier. `featured`
 * pilote en plus la vignette "à la une" de l'accueil, indépendamment de ce regroupement.
 */
export interface Project {
  id: number;
  slug: string;
  serviceId: number;
  serviceSlug: string;
  titleFr: string;
  titleEn: string;
  locationFr: string;
  locationEn: string;
  typologyFr: string;
  typologyEn: string;
  year: string;
  descriptionFr: string;
  descriptionEn: string;
  image: string;
  gallery: string[];
  featured: boolean;
  sortOrder: number;
  status: ProjectStatus;
  updatedAt: string;
}

// Le slug est généré une seule fois par le backend à la création (voir Athl_logistics-backend,
// ProjectServiceImpl) et reste ensuite immuable : le BO ne l'édite jamais, il l'affiche seulement.
export type ProjectUpsertRequest = Omit<Project, 'id' | 'slug' | 'serviceSlug' | 'updatedAt'>;

export function emptyProjectForm(): ProjectUpsertRequest {
  return {
    serviceId: 0,
    titleFr: '',
    titleEn: '',
    locationFr: '',
    locationEn: '',
    typologyFr: '',
    typologyEn: '',
    year: '',
    descriptionFr: '',
    descriptionEn: '',
    image: '',
    gallery: [],
    featured: false,
    sortOrder: 0,
    status: 'draft',
  };
}
