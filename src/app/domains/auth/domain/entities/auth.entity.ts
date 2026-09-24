export type RoleName = 'ADMIN' | 'SUPER_ADMIN';

export interface UserRole {
  roleName: RoleName;
}

export interface CurrentUser {
  userId: number;
  email: string;
  firstName: string;
  lastName: string;
  phoneNumber?: string | null;
  profilePictureUrl?: string | null;
  creationDate: string;
  active: boolean;
  roles: UserRole[];
}

export interface AuthenticateRequest {
  email: string;
  password: string;
  rememberMe: boolean;
}

export interface AuthenticateResponse {
  token: string;
}

export interface UpdateProfileRequest {
  firstName: string;
  lastName: string;
  phoneNumber?: string;
  profilePictureUrl?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}

export interface ActivateAccountRequest {
  code: string;
  newPassword: string;
}

export interface ResendActivationRequest {
  email: string;
}
