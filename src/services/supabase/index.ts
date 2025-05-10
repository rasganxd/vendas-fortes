
// Re-export all services from their specific files
export { createStandardService } from './core';
export { createLoadOrdersService } from './loadOrderService';

// Customer services
export { customerService } from './customerService';

// Order services
export { orderService } from './orderService';

// Product services
export { 
  productService,
  productGroupService,
  productCategoryService, 
  productBrandService,
  createBulkProducts
} from './productService';

// Load services
export { 
  loadService,
  loadOrderService 
} from './loadService';

// Payment services
export { 
  paymentService,
  paymentMethodService,
  paymentTableService 
} from './paymentService';

// Sales rep services
export { salesRepService } from './salesRepService';

// Export types for external use
export * from './types';
