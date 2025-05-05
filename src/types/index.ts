
// Re-export all types from their domain-specific files
export * from './customer';
export * from './product';

// For order.ts, need to be explicit to avoid duplicate exports
export { 
  Order, 
  OrderStatus, 
  OrderItem as OrderItemType,  // Rename one of the exports to avoid conflict
  PaymentSummary
} from './order';

export * from './payment';
export * from './delivery';
export * from './personnel';
export * from './system';
export * from './ui';
export * from './vehicle';
