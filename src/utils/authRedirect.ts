
import { UserProfile } from '@/types/auth';

export const getRedirectPathForRole = (userProfile: UserProfile | null): string => {
  if (!userProfile) return '/login';
  
  switch (userProfile.role) {
    case 'vendedor':
      return '/mobile';
    case 'admin':
    case 'manager':
      return '/dashboard';
    default:
      return '/dashboard';
  }
};

export const isAuthorizedForRoute = (userProfile: UserProfile | null, route: string): boolean => {
  if (!userProfile) return false;
  
  // Vendedores só podem acessar rotas mobile
  if (userProfile.role === 'vendedor') {
    return route.startsWith('/mobile');
  }
  
  // Admin e Manager podem acessar todas as rotas desktop
  if (['admin', 'manager'].includes(userProfile.role)) {
    return !route.startsWith('/mobile');
  }
  
  return false;
};
