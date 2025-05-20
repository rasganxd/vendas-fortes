
import notificationService, { 
  NotificationOptions, 
  NotificationType 
} from '@/services/notificationService';

/**
 * No-op implementation of notification hook
 * This maintains compatibility with existing code
 */
export const useNotification = () => {
  // Function to log to console instead of showing notifications
  const showNotification = (
    title: React.ReactNode, 
    options: NotificationOptions = {}, 
    type: NotificationType = 'info'
  ) => {
    // Use our notification service which now just logs to console
    return notificationService[type](title, options);
  };
  
  // Expose the notification API with no-op methods
  return {
    notification: {
      show: (title: React.ReactNode, options?: NotificationOptions) => 
        showNotification(title, options, 'info'),
      success: (title: React.ReactNode, options?: NotificationOptions) => 
        showNotification(title, options, 'success'),
      error: (title: React.ReactNode, options?: NotificationOptions) => 
        showNotification(title, options, 'error'),
      warning: (title: React.ReactNode, options?: NotificationOptions) => 
        showNotification(title, options, 'warning'),
      info: (title: React.ReactNode, options?: NotificationOptions) => 
        showNotification(title, options, 'info'),
    }
  };
};
