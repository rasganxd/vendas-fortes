
export const isMobileDevice = (): boolean => {
  if (typeof window === 'undefined') return false;
  
  // Check for mobile user agent
  const mobileUserAgents = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;
  const isMobileUserAgent = mobileUserAgents.test(navigator.userAgent);
  
  // Check for small screen size
  const isSmallScreen = window.innerWidth <= 768;
  
  // Check for touch capability
  const isTouchDevice = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  
  return isMobileUserAgent || (isSmallScreen && isTouchDevice);
};

export const shouldUseMobileInterface = (userRole: string, isMobile: boolean): boolean => {
  // Vendedores sempre usam interface mobile
  if (userRole === 'vendedor') return true;
  
  // Admin/Manager em dispositivos móveis podem escolher, mas padrão é desktop
  return false;
};

export const getRedirectPath = (userRole: string, isMobile: boolean): string => {
  if (shouldUseMobileInterface(userRole, isMobile)) {
    return '/mobile';
  }
  return '/dashboard';
};
