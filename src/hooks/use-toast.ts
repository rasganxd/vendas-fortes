
// This file now provides a no-op toast implementation
// All toast functionality has been removed

// Type definitions to maintain compatibility with existing code
export interface ToastProps {
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: React.ReactElement;
  variant?: "default" | "destructive" | "warning";
}

export type ToastActionElement = React.ReactElement;

/**
 * No-op implementation of toast functions
 * This maintains compatibility with existing code but doesn't show notifications
 */
export function toast(
  titleOrOptions: string | ToastProps,
  options?: { description?: React.ReactNode; variant?: "default" | "destructive" | "warning" }
) {
  // Log to console instead of showing notification
  if (typeof titleOrOptions === 'object') {
    console.log('[Toast]', titleOrOptions.title, titleOrOptions.description || '');
  } else {
    console.log('[Toast]', titleOrOptions, options?.description || '');
  }
  
  // Return an empty string as ID for compatibility
  return '';
}

// No-op versions of the shorthand methods
toast.success = (message: string, options?: { description?: React.ReactNode }) => {
  console.log('[Toast Success]', message, options?.description || '');
  return '';
};

toast.error = (message: string, options?: { description?: React.ReactNode }) => {
  console.log('[Toast Error]', message, options?.description || '');
  return '';
};

toast.warning = (message: string, options?: { description?: React.ReactNode }) => {
  console.log('[Toast Warning]', message, options?.description || '');
  return '';
};

/**
 * No-op implementation of useToast
 */
export function useToast() {
  return { toast };
}
