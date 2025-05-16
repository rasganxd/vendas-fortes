
// We're standardizing on using Sonner for toasts
import { toast as sonnerToast } from "sonner";

// Type definitions to maintain compatibility with existing code
export interface ToastProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  variant?: "default" | "destructive" | "warning";
}

export type ToastActionElement = React.ReactElement;

// Create a wrapper function that handles both formats
// It can accept either a string or the legacy object format
export const toast = (
  messageOrProps: string | ToastProps, 
  options?: { description?: React.ReactNode; variant?: "default" | "destructive" | "warning" }
) => {
  // If it's a string, use it directly with sonner
  if (typeof messageOrProps === 'string') {
    if (options?.variant === "destructive") {
      return sonnerToast.error(messageOrProps, { description: options?.description });
    } else if (options?.variant === "warning") {
      return sonnerToast.warning(messageOrProps, { description: options?.description });
    }
    return sonnerToast(messageOrProps, { description: options?.description });
  }
  
  // If it's an object with the old format, extract title and description
  const { title, description, variant } = messageOrProps;
  
  // Use the appropriate sonner method based on variant
  if (variant === "destructive") {
    return sonnerToast.error(title as string, { description });
  } else if (variant === "warning") {
    return sonnerToast.warning(title as string, { description });
  }
  
  return sonnerToast(title as string, { description });
};

// Add error shorthand for destructive variant
toast.error = (
  messageOrProps: string | ToastProps, 
  options?: { description?: React.ReactNode }
) => {
  // If it's a string, use it directly with sonner's error method
  if (typeof messageOrProps === 'string') {
    return sonnerToast.error(messageOrProps, options);
  }
  
  // If it's an object with the old format, extract title and description
  const { title, description } = messageOrProps;
  return sonnerToast.error(title as string, { description });
};

// Add warning shorthand
toast.warning = (
  messageOrProps: string | ToastProps, 
  options?: { description?: React.ReactNode }
) => {
  // If it's a string, use it directly with sonner's warning method
  if (typeof messageOrProps === 'string') {
    return sonnerToast.warning(messageOrProps, options);
  }
  
  // If it's an object with the old format, extract title and description
  const { title, description } = messageOrProps;
  return sonnerToast.warning(title as string, { description });
};

// Simple function to match the original toast API, but using Sonner
export function useToast() {
  return {
    toast: (props: ToastProps) => {
      const { title, description, variant } = props;
      
      if (variant === "destructive") {
        return sonnerToast.error(title as string, { description });
      } else if (variant === "warning") {
        return sonnerToast.warning(title as string, { description });
      }
      
      return sonnerToast(title as string, { description });
    },
    // These exist in the original API but will be no-ops
    dismiss: () => {},
    toasts: []
  };
}
