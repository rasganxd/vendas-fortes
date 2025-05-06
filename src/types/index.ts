
// Re-export all types from their domain-specific files
export * from './customer';
export * from './product';

// For order.ts, need to be explicit to avoid duplicate exports
export { Order } from './order';
export type { OrderStatus } from './order';
export type { OrderItem } from './order';
export type { PaymentSummary } from './order';

export * from './payment';
export * from './delivery';
export * from './personnel';
export * from './system';
export * from './ui';
export * from './vehicle';
