export type RoleName = 'ADMIN' | 'SUPER_ADMIN';

export interface UserRole {
  roleName: RoleName;
}

/** `UserSummaryDTO` — voir docs/API-GESTION-UTILISATEURS.md §6 (GET /users) */
export interface UserSummary {
  id: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string | null;
  profilePictureUrl?: string | null;
  creationDate: string;
  // Jackson sérialise le getter Java `isActive()` en "active" (pas "isActive").
  active: boolean;
  roles: UserRole[];
}

export interface RegisterUserRequest {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  roleName: RoleName;
}

export function userFullName(u: UserSummary): string {
  return `${u.firstName} ${u.lastName}`.trim();
}

export function userInitials(u: UserSummary): string {
  return `${u.firstName?.[0] ?? ''}${u.lastName?.[0] ?? ''}`.toUpperCase() || '?';
}

export function userRoleLabel(u: UserSummary): string {
  const role = u.roles?.[0]?.roleName;
  return role === 'SUPER_ADMIN' ? 'Super admin' : role === 'ADMIN' ? 'Administrateur' : '—';
}
