
import { createStandardService } from './core';

/**
 * Services for payment-related operations
 */
export const paymentService = createStandardService('payments');
export const paymentMethodService = createStandardService('payment_methods');
export const paymentTableService = createStandardService('payment_tables');
