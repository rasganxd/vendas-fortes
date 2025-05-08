
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from 'uuid';
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

// Generate a unique ID using uuid
export function generateId(): string {
  return uuidv4();
}

// Generate a random order code (6-digit number)
export function generateOrderCode(): number {
  return Math.floor(100000 + Math.random() * 900000);
}

// Function to initialize default CSS variables for themes
export function initializeThemeVariables(): void {
  // Default theme colors
  const defaultPrimary = '221 83% 53%'; // #1C64F2 in HSL
  const defaultSecondary = '186 94% 25%'; // #047481 in HSL
  const defaultAccent = '184 89% 32%'; // #0694A2 in HSL
  const salesDefault = '221 83% 53%'; // #1C64F2 in HSL - same as primary for consistency

  // Set default variables if they don't exist yet
  if (!getComputedStyle(document.documentElement).getPropertyValue('--primary').trim()) {
    document.documentElement.style.setProperty('--primary', defaultPrimary);
  }
  
  if (!getComputedStyle(document.documentElement).getPropertyValue('--secondary').trim()) {
    document.documentElement.style.setProperty('--secondary', defaultSecondary);
  }
  
  if (!getComputedStyle(document.documentElement).getPropertyValue('--accent').trim()) {
    document.documentElement.style.setProperty('--accent', defaultAccent);
  }
  
  // Add sidebar variables which are variants of primary
  document.documentElement.style.setProperty('--sidebar-primary', 
    document.documentElement.style.getPropertyValue('--primary') || defaultPrimary);
    
  // Ensure sales colors are consistent with the primary blue
  document.documentElement.style.setProperty('--sales', salesDefault);
}

// Convert HEX color to HSL format (helper function)
export function hexToHSL(hex: string): string {
  // Remove the # if present
  hex = hex.replace(/^#/, '');
  
  // Parse the hex values
  const r = parseInt(hex.slice(0, 2), 16) / 255;
  const g = parseInt(hex.slice(2, 4), 16) / 255;
  const b = parseInt(hex.slice(4, 6), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s = 0;
  const l = (max + min) / 2;
  
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
  const lightness = Math.round(l * 100);
  
  return `${h} ${s}% ${lightness}%`;
}
