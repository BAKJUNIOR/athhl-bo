/**
 * Reprend `TeamMember` du front (domains/vitrine/domain/team-member.entity.ts) :
 * {name, role, photo}. Le nom n'est pas traduit côté front (seul le rôle l'est), d'où
 * roleFr/roleEn ici. `sortOrder` pilote l'ordre d'affichage sur la page Équipe.
 *
 * quoteFr/quoteEn/initials servent au carrousel de témoignages de l'accueil : un membre avec une
 * citation renseignée y apparaît aussi, avec sa photo/nom/fonction déjà saisis ici — pas de
 * ressource "témoignages" séparée.
 */
export interface TeamMember {
  id: number;
  name: string;
  roleFr: string;
  roleEn: string;
  photo: string;
  bioFr: string;
  bioEn: string;
  quoteFr: string;
  quoteEn: string;
  initials: string;
  sortOrder: number;
  updatedAt: string;
}

export type TeamMemberUpsertRequest = Omit<TeamMember, 'id' | 'updatedAt'>;

export function emptyTeamMemberForm(nextSortOrder: number): TeamMemberUpsertRequest {
  return { name: '', roleFr: '', roleEn: '', photo: '', bioFr: '', bioEn: '', quoteFr: '', quoteEn: '', initials: '', sortOrder: nextSortOrder };
}
