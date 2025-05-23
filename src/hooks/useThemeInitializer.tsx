
import { useEffect } from 'react';

/**
 * Hook to initialize and apply the theme color
 * @param color Optional custom color to apply
 */
export const useThemeInitializer = (color?: string) => {
  useEffect(() => {
    const softBlueColor = '#4a86e8'; // Soft blue as default
    const themeColor = color || softBlueColor;
    
    const style = document.createElement('style');
    style.innerHTML = `
      :root {
        --primary: ${themeColor} !important;
        --ring: ${themeColor} !important;
        --sidebar-primary: ${themeColor} !important;
      }
    `;
    document.head.appendChild(style);
    
    // Cleanup function to remove style element when component unmounts
    return () => {
      if (document.head.contains(style)) {
        document.head.removeChild(style);
      }
    };
  }, [color]);
};
