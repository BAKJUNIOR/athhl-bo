/**
 * Reprend `Testimonial` du front (domains/vitrine/domain/testimonial.entity.ts) :
 * {photo, initials, text, name, role}. Le nom n'est pas traduit côté front, d'où
 * roleFr/roleEn et textFr/textEn ici. `sortOrder` pilote l'ordre du carrousel accueil.
 */
export interface Testimonial {
  id: number;
  name: string;
  roleFr: string;
  roleEn: string;
  textFr: string;
  textEn: string;
  photo: string;
  initials: string;
  sortOrder: number;
  updatedAt: string;
}

export type TestimonialUpsertRequest = Omit<Testimonial, 'id' | 'updatedAt'>;

export function emptyTestimonialForm(nextSortOrder: number): TestimonialUpsertRequest {
  return { name: '', roleFr: '', roleEn: '', textFr: '', textEn: '', photo: '', initials: '', sortOrder: nextSortOrder };
}
