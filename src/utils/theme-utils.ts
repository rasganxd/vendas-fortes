
/**
 * Utility functions for theme management
 */

// Cache key for storing theme colors in localStorage
export const THEME_COLORS_CACHE_KEY = 'app-theme-colors';

/**
 * Converts hex color to HSL string format with options to darken
 * @param hex - Hex color code (with or without #)
 * @param options - Options for conversion (darken: boolean)
 * @returns HSL color string in format "h s% l%"
 */
export function convertHexToHSL(hex: string, options?: { darken?: boolean }): string {
  try {
    // Remove the # if present
    hex = hex.replace(/^#/, '');
    
    // Handle different hex formats (3 or 6 digits)
    let r, g, b;
    
    if (hex.length === 3) {
      r = parseInt(hex[0] + hex[0], 16) / 255;
      g = parseInt(hex[1] + hex[1], 16) / 255;
      b = parseInt(hex[2] + hex[2], 16) / 255;
    } else if (hex.length === 6) {
      r = parseInt(hex.slice(0, 2), 16) / 255;
      g = parseInt(hex.slice(2, 4), 16) / 255;
      b = parseInt(hex.slice(4, 6), 16) / 255;
    } else {
      console.error('Invalid hex color format:', hex);
      return '210 100% 50%'; // Default blue as fallback
    }
    
    const max = Math.max(r, g, b);
    const min = Math.min(r, g, b);
    let h = 0;
    let s = 0;
    let l = (max + min) / 2;
    
    if (max !== min) {
      const d = max - min;
      s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
      
      switch (max) {
        case r:
          h = (g - b) / d + (g < b ? 6 : 0);
          break;
        case g:
          h = (b - r) / d + 2;
          break;
        case b:
          h = (r - g) / d + 4;
          break;
      }
      
      h = Math.round(h * 60);
    }
    
    s = Math.round(s * 100);
    
    // Option to darken the color for sidebar background
    if (options?.darken) {
      // Reduce lightness for a darker shade of the same color
      // This helps create a nice contrast for sidebar backgrounds
      l = Math.max(l * 0.4, 0.1); // Make it darker but not too dark
    }
    
    const lightness = Math.round(l * 100);
    
    return `${h} ${s}% ${lightness}%`;
  } catch (err) {
    console.error('Error converting hex to HSL:', err);
    return '210 100% 50%'; // Default blue as fallback
  }
}

/**
 * Handles applying theme colors to CSS variables
 * @param theme - Theme object with color values
 */
export function applyThemeColors(theme?: { 
  primaryColor?: string; 
  secondaryColor?: string; 
  accentColor?: string;
}): void {
  if (!theme) {
    console.log('No theme colors to apply');
    return;
  }
  
  console.log('Applying theme colors:', theme);
  
  try {
    // Store in local storage for persistence
    localStorage.setItem(THEME_COLORS_CACHE_KEY, JSON.stringify(theme));
    
    // Convert hex to HSL and apply to CSS variables
    if (theme.primaryColor) {
      const primaryHsl = convertHexToHSL(theme.primaryColor);
      document.documentElement.style.setProperty('--primary', primaryHsl);
      
      // Set sidebar background to a darker shade based on the primary color
      // This creates a cohesive theme while ensuring contrast for text
      const sidebarBackgroundHsl = convertHexToHSL(theme.primaryColor, { darken: true });
      document.documentElement.style.setProperty('--sidebar-background', sidebarBackgroundHsl);
      
      // Explicitly set sidebar variables to match the theme
      document.documentElement.style.setProperty('--sidebar-primary', primaryHsl);
      document.documentElement.style.setProperty('--ring', primaryHsl);
    }
    
    if (theme.secondaryColor) {
      const secondaryHsl = convertHexToHSL(theme.secondaryColor);
      document.documentElement.style.setProperty('--secondary', secondaryHsl);
    }
    
    if (theme.accentColor) {
      const accentHsl = convertHexToHSL(theme.accentColor);
      document.documentElement.style.setProperty('--accent', accentHsl);
      
      // Also update sidebar accent colors
      document.documentElement.style.setProperty('--sidebar-accent', accentHsl);
    }
    
    // Force a repaint to ensure the changes are applied
    const body = document.body;
    const display = body.style.display;
    body.style.display = 'none';
    void body.offsetHeight; // This triggers a reflow
    body.style.display = display || '';
    
    // Dispatch a custom event that sidebar components can listen to
    const themeChangeEvent = new CustomEvent('app-theme-changed', {
      detail: { theme }
    });
    document.dispatchEvent(themeChangeEvent);
    
    console.log('Theme colors applied successfully');
  } catch (err) {
    console.error('Error applying theme colors:', err);
  }
}

/**
 * Loads theme from localStorage cache
 */
export function loadCachedTheme(): void {
  try {
    const cachedTheme = localStorage.getItem(THEME_COLORS_CACHE_KEY);
    if (cachedTheme) {
      const parsedTheme = JSON.parse(cachedTheme);
      console.log('Loaded cached theme colors:', parsedTheme);
      applyThemeColors(parsedTheme);
    }
  } catch (err) {
    console.error('Error loading cached theme:', err);
  }
}
