import { JwtService } from './jwt.service';

function tokenWith(roles: string[]): string {
  const payload = btoa(JSON.stringify({ sub: 'x', exp: 9999999999, iat: 0, auth: roles }));
  return `header.${payload}.signature`;
}

describe('JwtService — rôles', () => {
  const jwt = new JwtService();

  it('ADMIN : accès au BO, pas à la gestion des utilisateurs', () => {
    const token = tokenWith(['ADMIN']);
    expect(jwt.isAdmin(token)).toBe(true);
    expect(jwt.isSuperAdmin(token)).toBe(false);
  });

  it('SUPER_ADMIN : accès à tout', () => {
    const token = tokenWith(['SUPER_ADMIN']);
    expect(jwt.isAdmin(token)).toBe(true);
    expect(jwt.isSuperAdmin(token)).toBe(true);
  });

  it('sans rôle ou sans jeton : aucun accès', () => {
    expect(jwt.isAdmin(tokenWith([]))).toBe(false);
    expect(jwt.isAdmin(null)).toBe(false);
    expect(jwt.isSuperAdmin(null)).toBe(false);
  });
});
