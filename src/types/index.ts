
// Re-export types from individual files for convenience
export * from './customer';
export * from './order';
export * from './payment';
export * from './personnel';
export * from './product';
export * from './system';
export * from './ui';

// Export Vehicle type specifically from vehicle.ts to avoid ambiguity
export type { Vehicle } from './vehicle';

// Export delivery types excluding Vehicle to avoid conflict
export type { 
  DeliveryRoute, 
  RouteStop, 
  Load, 
  LoadItem 
} from './delivery';
