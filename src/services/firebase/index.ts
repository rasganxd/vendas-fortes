
// Export all Firebase services from a single file for easier imports

// Firebase config
export { db, auth } from './config';

// Firestore services
export { customerService } from './customerService';
export { productService } from './productService';
export { salesRepService } from './salesRepService';
export { vehicleService } from './vehicleService';
export { orderService } from './orderService';
export { loadService } from './loadService';
export { paymentService } from './paymentService';
export { paymentMethodService } from './paymentMethodService';
export { paymentTableService } from './paymentTableService';
export { productCategoryService } from './productCategoryService';
export { productBrandService } from './productBrandService';
export { productGroupService } from './productGroupService';
export { deliveryRouteService } from './deliveryRouteService';

// Firestore utilities
export { initializeFirestore } from './initializeFirestore';
