
/**
 * Streamlined utility functions for theme management
 */

// Cache key for storing theme colors in localStorage
export const THEME_COLORS_CACHE_KEY = 'app-theme-colors';

/**
 * Converts hex color to HSL string format
 * @param hex - Hex color code (with or without #)
 * @returns HSL color string in format "h s% l%"
 */
export function convertHexToHSL(hex: string): string {
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
      if (h < 0) h += 360;
    }
    
    // Calculate saturation and lightness percentages
    s = Math.round(s * 100);
    const lightness = Math.round(l * 100);
    
    // Return precise HSL values
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
  primary?: string;
  secondary?: string;
  accent?: string;
}): void {
  if (!theme) {
    console.log('No theme colors to apply');
    return;
  }
  
  try {
    // Store in local storage for persistence
    localStorage.setItem(THEME_COLORS_CACHE_KEY, JSON.stringify(theme));
    
    // Convert hex to HSL and apply to CSS variables
    // Use primaryColor first, fall back to primary if not available
    const primaryColor = theme.primaryColor || theme.primary;
    const secondaryColor = theme.secondaryColor || theme.secondary;
    const accentColor = theme.accentColor || theme.accent;
    
    if (primaryColor) {
      const primaryHsl = convertHexToHSL(primaryColor);
      document.documentElement.style.setProperty('--primary', primaryHsl);
      document.documentElement.style.setProperty('--sidebar-primary', primaryHsl);
      document.documentElement.style.setProperty('--ring', primaryHsl);
      
      // Create a darker version of the primary color for sidebar background
      const darkPrimaryHex = adjustColorBrightness(primaryColor, -0.3);
      const darkPrimaryHsl = convertHexToHSL(darkPrimaryHex);
      document.documentElement.style.setProperty('--sidebar-background', darkPrimaryHsl);
    }
    
    if (secondaryColor) {
      const secondaryHsl = convertHexToHSL(secondaryColor);
      document.documentElement.style.setProperty('--secondary', secondaryHsl);
    }
    
    if (accentColor) {
      const accentHsl = convertHexToHSL(accentColor);
      document.documentElement.style.setProperty('--accent', accentHsl);
      document.documentElement.style.setProperty('--sidebar-accent', accentHsl);
    }
    
    // Apply sidebar styling efficiently
    if (primaryColor) {
      const sidebarHeader = document.querySelector('.dynamic-sidebar-header') as HTMLElement;
      if (sidebarHeader) {
        sidebarHeader.style.backgroundColor = primaryColor;
        sidebarHeader.style.color = '#ffffff';
      }
    }
    
    // Dispatch a single event for theme changes
    document.dispatchEvent(new CustomEvent('app-theme-changed', {
      detail: { theme }
    }));
  } catch (err) {
    console.error('Error applying theme colors:', err);
  }
}

/**
 * Adjust color brightness - darkens or lightens a hex color
 * @param hex - Hex color code
 * @param percent - Amount to adjust (-1 to 1, negative darkens, positive lightens)
 * @returns Adjusted hex color
 */
export function adjustColorBrightness(hex: string, percent: number): string {
  hex = hex.replace(/^#/, '');
  
  // Parse the hex string
  let r = parseInt(hex.slice(0, 2), 16);
  let g = parseInt(hex.slice(2, 4), 16);
  let b = parseInt(hex.slice(4, 6), 16);
  
  // Convert to 0-1 range
  r = r / 255;
  g = g / 255;
  b = b / 255;
  
  // Adjust brightness
  if (percent < 0) {
    // Darken
    r = r * (1 + percent);
    g = g * (1 + percent);
    b = b * (1 + percent);
  } else {
    // Lighten
    r = r + (1 - r) * percent;
    g = g + (1 - g) * percent;
    b = b + (1 - b) * percent;
  }
  
  // Convert back to 0-255 range
  r = Math.round(Math.max(0, Math.min(255, r * 255)));
  g = Math.round(Math.max(0, Math.min(255, g * 255)));
  b = Math.round(Math.max(0, Math.min(255, b * 255)));
  
  // Convert to hex
  const rHex = r.toString(16).padStart(2, '0');
  const gHex = g.toString(16).padStart(2, '0');
  const bHex = b.toString(16).padStart(2, '0');
  
  return `#${rHex}${gHex}${bHex}`;
}

/**
 * Loads theme from localStorage cache
 */
export function loadCachedTheme(): void {
  try {
    const cachedTheme = localStorage.getItem(THEME_COLORS_CACHE_KEY);
    if (cachedTheme) {
      const parsedTheme = JSON.parse(cachedTheme);
      applyThemeColors(parsedTheme);
    }
  } catch (err) {
    console.error('Error loading cached theme:', err);
  }
}
