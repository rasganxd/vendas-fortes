
import { toast as sonnerToast } from "sonner";

// Type definitions to maintain compatibility with existing code
export interface ToastProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  variant?: "default" | "destructive" | "warning";
}

export type ToastActionElement = React.ReactElement;

/**
 * Standard toast function that wraps Sonner
 * 
 * Basic usage:
 * toast("Message")                 - Simple toast with just a message
 * toast("Title", { description })  - Toast with title and description
 * toast({ title, description })    - Toast with object configuration
 * 
 * Variants:
 * toast.success("Success message") - Success toast
 * toast.error("Error message")     - Error toast
 * toast.warning("Warning message") - Warning toast
 */
export function toast(
  titleOrOptions: string | ToastProps,
  options?: { description?: React.ReactNode; variant?: "default" | "destructive" | "warning" }
) {
  // Handle object-style calls: toast({ title, description, variant })
  if (typeof titleOrOptions === 'object') {
    const { title, description, variant } = titleOrOptions;
    
    if (variant === "destructive") {
      return sonnerToast.error(title as string, { description });
    } else if (variant === "warning") {
      return sonnerToast.warning(title as string, { description });
    }
    
    return sonnerToast(title as string, { description });
  }
  
  // Handle string-style calls: toast("Title", { description })
  if (options?.variant === "destructive") {
    return sonnerToast.error(titleOrOptions, { description: options?.description });
  } else if (options?.variant === "warning") {
    return sonnerToast.warning(titleOrOptions, { description: options?.description });
  }
  
  return sonnerToast(titleOrOptions, { description: options?.description });
}

// Add success shorthand 
toast.success = (message: string, options?: { description?: React.ReactNode }) => {
  return sonnerToast.success(message, options);
};

// Add error shorthand for destructive variant
toast.error = (message: string, options?: { description?: React.ReactNode }) => {
  return sonnerToast.error(message, options);
};

// Add warning shorthand
toast.warning = (message: string, options?: { description?: React.ReactNode }) => {
  return sonnerToast.warning(message, options);
};

// Simple hook function that returns the toast function
export function useToast() {
  return {
    toast
  };
}
