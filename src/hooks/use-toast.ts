
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
 * 
 * Variants:
 * toast.success("Success message") - Success toast
 * toast.error("Error message")     - Error toast
 * toast.warning("Warning message") - Warning toast
 */
export function toast(
  titleOrMessage: string,
  options?: { description?: React.ReactNode; variant?: "default" | "destructive" | "warning" }
) {
  if (options?.variant === "destructive") {
    return sonnerToast.error(titleOrMessage, { description: options?.description });
  } else if (options?.variant === "warning") {
    return sonnerToast.warning(titleOrMessage, { description: options?.description });
  }
  
  return sonnerToast(titleOrMessage, { description: options?.description });
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
