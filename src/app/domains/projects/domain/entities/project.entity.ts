export type ProjectStatus = 'draft' | 'published';

export function projectStatusLabel(status: ProjectStatus): string {
  return status === 'published' ? 'Publié' : 'Brouillon';
}

/**
 * Reprend la structure `Shot` du front (domains/vitrine/presentation/pages/projects/
 * projects.component.ts) : {image, title, caption, wide?}. `featured` pilote l'apparition
 * dans la mosaïque de la home (aujourd'hui juste 5 images sans métadonnée côté front),
 * `status` la visibilité sur la page /projets.
 */
export interface Project {
  id: number;
  titleFr: string;
  titleEn: string;
  captionFr: string;
  captionEn: string;
  image: string;
  featured: boolean;
  wide: boolean;
  status: ProjectStatus;
  updatedAt: string;
}

export type ProjectUpsertRequest = Omit<Project, 'id' | 'updatedAt'>;

export function emptyProjectForm(): ProjectUpsertRequest {
  return {
    titleFr: '',
    titleEn: '',
    captionFr: '',
    captionEn: '',
    image: '',
    featured: false,
    wide: false,
    status: 'draft',
  };
}
