
import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import { v4 as uuidv4 } from 'uuid';
 
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatCurrency(value: number | undefined | null): string {
  // Handle undefined, null, or NaN values
  if (value === undefined || value === null || isNaN(value)) {
    value = 0;
  }
  
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
