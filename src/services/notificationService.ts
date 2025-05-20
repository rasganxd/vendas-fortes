
// Type definitions for compatibility with existing code
export type NotificationType = 'success' | 'error' | 'warning' | 'info';
export type NotificationPriority = 'high' | 'normal' | 'low';

export interface NotificationOptions {
  description?: React.ReactNode;
  duration?: number;
  priority?: NotificationPriority;
  id?: string;
  persist?: boolean;
  onClose?: () => void;
}

export interface Notification {
  id: string;
  title: React.ReactNode;
  type: NotificationType;
  description?: React.ReactNode;
  timestamp: number;
  duration: number;
  priority: NotificationPriority;
  persist: boolean;
  onClose?: () => void;
}

/**
 * No-op notification service that just logs to console
 * This maintains compatibility with existing code
 */
const dispatchNotification = (
  title: React.ReactNode,
  options: NotificationOptions = {},
  type: NotificationType = 'info'
): string => {
  // Log to console instead of showing notification
  console.log('[Notification]', type, title, options.description || '');
  
  // Return a fixed string as ID for compatibility
  return 'notification-disabled';
};

// Create the notification service API with no-op methods
const notificationService = {
  show: (title: React.ReactNode, options?: NotificationOptions) => 
    dispatchNotification(title, options, 'info'),
    
  success: (title: React.ReactNode, options?: NotificationOptions) => 
    dispatchNotification(title, options, 'success'),
    
  error: (title: React.ReactNode, options?: NotificationOptions) => 
    dispatchNotification(title, options, 'error'),
    
  warning: (title: React.ReactNode, options?: NotificationOptions) => 
    dispatchNotification(title, options, 'warning'),
    
  info: (title: React.ReactNode, options?: NotificationOptions) => 
    dispatchNotification(title, options, 'info'),
};

export default notificationService;
