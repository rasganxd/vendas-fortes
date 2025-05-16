
// We're standardizing on using Sonner for toasts
import { toast as sonnerToast } from "sonner";

// Type definitions to maintain compatibility with existing code
export interface ToastProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  variant?: "default" | "destructive";
}

export type ToastActionElement = React.ReactElement;

// Create a wrapper function that matches Sonner's API
export const toast = (message: string, options?: { description?: React.ReactNode }) => {
  return sonnerToast(message, options);
};

// Add error shorthand for destructive variant
toast.error = (message: string, options?: { description?: React.ReactNode }) => {
  return sonnerToast.error(message, options);
};

// Simple function to match the original toast API, but using Sonner
export function useToast() {
  return {
    toast: (props: ToastProps) => {
      const { title, description, variant } = props;
      
      if (variant === "destructive") {
        return sonnerToast.error(title as string, { description });
      }
      
      return sonnerToast(title as string, { description });
    },
    // These exist in the original API but will be no-ops
    dismiss: () => {},
    toasts: []
  };
}
