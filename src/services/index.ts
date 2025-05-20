
// Export all services from a single file for easier imports
export * from './firebase/index';
export * from './local/index';

// Re-export specific services
export * from './settings/settingsService';
export { mobileSyncService } from './firebase/mobileSyncService';
