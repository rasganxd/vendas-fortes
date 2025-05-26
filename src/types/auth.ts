
export type UserRole = 'admin' | 'manager' | 'vendedor';

export interface UserProfile {
  id: string;
  userId: string;
  role: UserRole;
  name: string;
  email: string;
  phone?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface AuthContextType {
  user: any;
  session: any;
  userProfile: UserProfile | null;
  isLoading: boolean;
  isMobile: boolean;
  signOut: () => Promise<void>;
}
