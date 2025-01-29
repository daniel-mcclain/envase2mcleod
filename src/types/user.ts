export interface UserProfile {
  uid: string;
  email: string;
  displayName: string | null;
  role: 'admin' | 'supervisor' | 'user';
  lastLogin: string;
  lastPasswordChange: string;
  createdAt: string;
  updatedAt: string;
}

export type UserRole = 'admin' | 'supervisor' | 'user';