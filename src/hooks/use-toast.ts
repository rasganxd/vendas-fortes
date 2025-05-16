
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

// Export the original Sonner toast function
export const toast = sonnerToast;

// Simple function to match the original toast API, but using Sonner
export function useToast() {
  return {
    toast: (props: ToastProps) => {
      const { title, description, variant } = props;
      
      if (variant === "destructive") {
        return sonnerToast.error(title, { description });
      }
      
      return sonnerToast(title, { description });
    },
    // These exist in the original API but will be no-ops
    dismiss: () => {},
    toasts: []
  };
}
