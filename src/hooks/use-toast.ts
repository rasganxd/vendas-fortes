
// We're standardizing on using Sonner for toasts
import { toast } from "sonner";

// Type definitions to maintain compatibility with existing code
export interface ToastProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  variant?: "default" | "destructive";
}

export type ToastActionElement = React.ReactElement;

// Simple function to match the original toast API, but using Sonner
export function useToast() {
  return {
    toast: (props: ToastProps) => {
      const { title, description, variant } = props;
      
      if (variant === "destructive") {
        return toast.error(title, { description });
      }
      
      return toast(title, { description });
    },
    // These exist in the original API but will be no-ops
    dismiss: () => {},
    toasts: []
  };
}
