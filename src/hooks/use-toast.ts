
import { useNotification } from './useNotification';
import notificationService, { NotificationOptions } from '@/services/notificationService';

// Type definitions to maintain compatibility with existing code
export interface ToastProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  variant?: "default" | "destructive" | "warning";
}

export type ToastActionElement = React.ReactElement;

/**
 * Enhanced toast function that uses our notification system
 * with duplicate prevention and theme support
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
      return notificationService.error(title as string, { description } as NotificationOptions);
    } else if (variant === "warning") {
      return notificationService.warning(title as string, { description } as NotificationOptions);
    }
    
    return notificationService.show(title as string, { description } as NotificationOptions);
  }
  
  // Handle string-style calls: toast("Title", { description })
  if (options?.variant === "destructive") {
    return notificationService.error(titleOrOptions, { description: options?.description } as NotificationOptions);
  } else if (options?.variant === "warning") {
    return notificationService.warning(titleOrOptions, { description: options?.description } as NotificationOptions);
  }
  
  return notificationService.show(titleOrOptions, { description: options?.description } as NotificationOptions);
}

// Add success shorthand 
toast.success = (message: string, options?: { description?: React.ReactNode }) => {
  return notificationService.success(message, options as NotificationOptions);
};

// Add error shorthand for destructive variant
toast.error = (message: string, options?: { description?: React.ReactNode }) => {
  return notificationService.error(message, options as NotificationOptions);
};

// Add warning shorthand
toast.warning = (message: string, options?: { description?: React.ReactNode }) => {
  return notificationService.warning(message, options as NotificationOptions);
};

/**
 * Hook that returns the toast function
 * This makes the hook usage consistent with how most expect it to work
 */
export function useToast() {
  return { toast };
}
