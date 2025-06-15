
import { toast as sonnerToast } from 'sonner';
import type { ReactElement } from 'react';

// Type definitions to maintain compatibility with existing code
export interface ToastProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ReactElement;
  variant?: "default" | "destructive" | "warning";
}

export type ToastActionElement = ReactElement;

type SonnerToastOptions = Parameters<typeof sonnerToast>[1];

// Overloaded function to handle both object-based and string-based calls
function toastOverload(props: ToastProps): void;
function toastOverload(
  title: string,
  options?: { description?: React.ReactNode; variant?: "default" | "destructive" | "warning" }
): void;
function toastOverload(
  propsOrTitle: ToastProps | string,
  options?: { description?: React.ReactNode; variant?: "default" | "destructive" | "warning" }
): void {
  if (typeof propsOrTitle === 'string') {
    const title = propsOrTitle;
    const toastOptions: SonnerToastOptions = { description: options?.description };

    switch (options?.variant) {
      case 'destructive': sonnerToast.error(title, toastOptions); break;
      case 'warning': sonnerToast.warning(title, toastOptions); break;
      default: sonnerToast.message(title, toastOptions); break;
    }
  } else {
    const { title, description, action, variant } = propsOrTitle;
    const toastOptions: SonnerToastOptions = { description, action };

    switch (variant) {
      case 'destructive': sonnerToast.error(title, toastOptions); break;
      case 'warning': sonnerToast.warning(title, toastOptions); break;
      default: sonnerToast.message(title, toastOptions); break;
    }
  }
}

// Assign shorthand methods to the main toast function
export const toast = Object.assign(toastOverload, {
  success: (message: string, options?: { description?: React.ReactNode }) => {
    sonnerToast.success(message, options);
  },
  error: (message: string, options?: { description?: React.ReactNode }) => {
    sonnerToast.error(message, options);
  },
  warning: (message: string, options?: { description?: React.ReactNode }) => {
    sonnerToast.warning(message, options);
  },
});

export function useToast() {
  return {
    toast,
  };
}
