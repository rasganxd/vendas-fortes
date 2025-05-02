
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

// Add the missing generateId function
export function generateId(): string {
  return uuidv4();
}

// Add the missing generateOrderCode function
export function generateOrderCode(): number {
  // Generate a random 6-digit number for order codes
  return Math.floor(100000 + Math.random() * 900000);
}
