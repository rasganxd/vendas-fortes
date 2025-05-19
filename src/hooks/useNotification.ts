
import { useCallback } from 'react';
import { toast as sonnerToast } from 'sonner';
import notificationService, { 
  NotificationOptions, 
  NotificationType 
} from '@/services/notificationService';
import { useAppSettings } from '@/hooks/useAppSettings';

/**
 * Hook for using themed notifications with duplicate prevention
 */
export const useNotification = () => {
  const { settings } = useAppSettings();
  
  // Use theme colors from settings if available
  const getThemeColors = useCallback(() => {
    return {
      primary: settings?.theme?.primaryColor || '#1C64F2',
      secondary: settings?.theme?.secondaryColor || '#047481',
      accent: settings?.theme?.accentColor || '#0694A2',
    };
  }, [settings?.theme]);
  
  // Function to show a notification with theme awareness
  const showNotification = useCallback((
    title: React.ReactNode, 
    options: NotificationOptions = {}, 
    type: NotificationType = 'info'
  ) => {
    // Use our notification service to prevent duplicates
    const notificationId = notificationService[type](title, options);
    
    // If it's a duplicate, don't show it
    if (!notificationId) return;
    
    const colors = getThemeColors();
    
    // Configure custom styling based on notification type and theme
    const baseStyle = {
      success: { 
        style: { borderLeft: `4px solid ${colors.secondary}` } 
      },
      error: { 
        style: { borderLeft: `4px solid #E02424` }  // Always red for errors
      },
      warning: { 
        style: { borderLeft: `4px solid #F59E0B` }  // Always amber for warnings
      },
      info: { 
        style: { borderLeft: `4px solid ${colors.primary}` } 
      }
    };
    
    // Use sonner toast with our configuration
    if (type === 'success') {
      return sonnerToast.success(title, {
        id: notificationId,
        description: options.description,
        duration: options.duration,
        ...baseStyle.success
      });
    } else if (type === 'error') {
      return sonnerToast.error(title, {
        id: notificationId,
        description: options.description,
        duration: options.duration,
        ...baseStyle.error
      });
    } else if (type === 'warning') {
      return sonnerToast.warning(title, {
        id: notificationId,
        description: options.description,
        duration: options.duration,
        ...baseStyle.warning
      });
    } else {
      return sonnerToast(title, {
        id: notificationId,
        description: options.description,
        duration: options.duration,
        ...baseStyle.info
      });
    }
  }, [getThemeColors]);
  
  // Expose the notification API
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
