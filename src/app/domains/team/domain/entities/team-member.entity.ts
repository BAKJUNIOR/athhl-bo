/**
 * Reprend `TeamMember` du front (domains/vitrine/domain/team-member.entity.ts) :
 * {name, role, photo}. Le nom n'est pas traduit côté front (seul le rôle l'est), d'où
 * roleFr/roleEn ici. `sortOrder` pilote l'ordre d'affichage sur la page Équipe.
 */
export interface TeamMember {
  id: number;
  name: string;
  roleFr: string;
  roleEn: string;
  photo: string;
  sortOrder: number;
  updatedAt: string;
}

export type TeamMemberUpsertRequest = Omit<TeamMember, 'id' | 'updatedAt'>;

export function emptyTeamMemberForm(nextSortOrder: number): TeamMemberUpsertRequest {
  return { name: '', roleFr: '', roleEn: '', photo: '', sortOrder: nextSortOrder };
}
