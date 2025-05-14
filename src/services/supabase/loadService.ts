
import { createStandardService } from './core';
import { loadOrderService } from './loadOrderService';

/**
 * Services for load-related operations
 */
export const loadService = createStandardService('loads');
export { loadOrderService };
