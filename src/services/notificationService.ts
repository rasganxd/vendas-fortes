
import { nanoid } from 'nanoid';

// Type definitions for our notification system
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

const DEFAULT_DURATION = 5000; // 5 seconds
const DUPLICATE_WINDOW = 5000; // 5 seconds window to consider as duplicate

// Internal store of recent notifications to prevent duplicates
const recentNotifications: Notification[] = [];

/**
 * Clean up old notifications from the recent notifications cache
 */
const cleanupOldNotifications = () => {
  const now = Date.now();
  const threshold = now - DUPLICATE_WINDOW;
  
  // Remove notifications older than the threshold
  while (recentNotifications.length > 0 && recentNotifications[0].timestamp < threshold) {
    recentNotifications.shift();
  }
};

/**
 * Generate a simple hash for notification content to help with duplicate detection
 * @param title The notification title
 * @param description The notification description
 * @returns A string hash representing the content
 */
const generateContentHash = (title: React.ReactNode, description?: React.ReactNode): string => {
  const titleStr = typeof title === 'string' ? title : JSON.stringify(title);
  const descStr = description ? 
    (typeof description === 'string' ? description : JSON.stringify(description)) 
    : '';
  
  // Simple string concatenation hash
  return `${titleStr}::${descStr}`;
};

/**
 * Check if a notification is a duplicate of a recent one
 */
const isDuplicate = (title: React.ReactNode, type: NotificationType, description?: React.ReactNode): boolean => {
  cleanupOldNotifications();
  
  // Generate content hash
  const contentHash = generateContentHash(title, description);
  
  // Check for similar content in recent notifications
  return recentNotifications.some(notification => 
    generateContentHash(notification.title, notification.description) === contentHash &&
    notification.type === type
  );
}

/**
 * Add a notification to the recent list to prevent duplicates
 */
const addToRecentNotifications = (notification: Notification) => {
  cleanupOldNotifications();
  recentNotifications.push(notification);
  
  // Keep the list at a reasonable size
  if (recentNotifications.length > 20) {
    recentNotifications.shift();
  }
};

/**
 * Core notification dispatch function that will be exposed
 */
const dispatchNotification = (
  title: React.ReactNode,
  options: NotificationOptions = {},
  type: NotificationType = 'info'
): string | undefined => {
  // Check for duplicates
  if (isDuplicate(title, type, options.description)) {
    console.log('Preventing duplicate notification:', { title, type });
    return undefined;
  }
  
  const id = options.id || nanoid();
  const notification: Notification = {
    id,
    title,
    type,
    description: options.description,
    timestamp: Date.now(),
    duration: options.duration || DEFAULT_DURATION,
    priority: options.priority || 'normal',
    persist: options.persist || false,
    onClose: options.onClose
  };
  
  // Add to recent notifications to prevent duplicates
  addToRecentNotifications(notification);
  
  // This will be replaced with actual toast implementation in the hook
  return id;
};

// Create the notification service API
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
