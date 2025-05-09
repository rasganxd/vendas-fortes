
import { createStandardService } from './core';
import { createLoadOrdersService } from './loadOrderService';

/**
 * Services for load-related operations
 */
export const loadService = createStandardService('loads');
export const loadOrderService = createLoadOrdersService();
