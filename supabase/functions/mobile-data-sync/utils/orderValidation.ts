
export interface OrderValidationResult {
  isValid: boolean;
  errors: string[];
  errorCode: string;
}

export interface OrderValidationRules {
  requirePaymentMethod: boolean;
  requireCustomer: boolean;
  requireSalesRep: boolean;
  requireItems: boolean;
  allowNegativeOrders: boolean;
}

const DEFAULT_VALIDATION_RULES: OrderValidationRules = {
  requirePaymentMethod: true,
  requireCustomer: true,
  requireSalesRep: true,
  requireItems: true,
  allowNegativeOrders: true, // Para pedidos de visita/rejeição
};

export function validateMobileOrder(orderData: any, rules: OrderValidationRules = DEFAULT_VALIDATION_RULES): OrderValidationResult {
  const errors: string[] = [];
  let errorCode = 'VALIDATION_ERROR';

  console.log('🔍 [OrderValidation] Validating mobile order:', {
    id: orderData.id,
    total: orderData.total,
    paymentMethod: orderData.paymentMethod,
    paymentMethodId: orderData.paymentMethodId,
    customerId: orderData.customerId,
    salesRepId: orderData.salesRepId,
    itemsCount: orderData.items?.length || 0
  });

  // Validação básica de estrutura
  if (!orderData.id) {
    errors.push('Order ID is required');
    errorCode = 'MISSING_ORDER_ID';
  }

  // Validação de cliente
  if (rules.requireCustomer) {
    if (!orderData.customerId || orderData.customerId.trim() === '') {
      errors.push('Customer ID is required');
      errorCode = 'MISSING_CUSTOMER';
    }
    
    if (!orderData.customerName || orderData.customerName.trim() === '') {
      errors.push('Customer name is required');
      errorCode = 'MISSING_CUSTOMER';
    }
  }

  // Validação de vendedor
  if (rules.requireSalesRep) {
    if (!orderData.salesRepId || orderData.salesRepId.trim() === '') {
      errors.push('Sales representative ID is required');
      errorCode = 'MISSING_SALES_REP';
    }
    
    if (!orderData.salesRepName || orderData.salesRepName.trim() === '') {
      errors.push('Sales representative name is required');
      errorCode = 'MISSING_SALES_REP';
    }
  }

  // Determinar se é um pedido normal ou de visita/rejeição
  const isNegativeOrder = orderData.total === 0 && orderData.rejectionReason;
  const isRegularOrder = orderData.total > 0;

  if (!isNegativeOrder && !isRegularOrder) {
    errors.push('Order must have positive total or be a negative order with rejection reason');
    errorCode = 'INVALID_ORDER_TYPE';
  }

  // Validação específica para pedidos normais (com valor)
  if (isRegularOrder) {
    // Validação de método de pagamento (obrigatório para pedidos com valor)
    if (rules.requirePaymentMethod) {
      if (!orderData.paymentMethodId || orderData.paymentMethodId.trim() === '') {
        errors.push('Payment method ID is required for orders with value');
        errorCode = 'MISSING_PAYMENT_METHOD';
      }
      
      if (!orderData.paymentMethod || orderData.paymentMethod.trim() === '') {
        errors.push('Payment method name is required for orders with value');
        errorCode = 'MISSING_PAYMENT_METHOD';
      }
      
      // Validar se paymentMethodId é um UUID válido
      if (orderData.paymentMethodId && !isValidUUID(orderData.paymentMethodId)) {
        errors.push('Payment method ID must be a valid UUID');
        errorCode = 'INVALID_PAYMENT_METHOD_ID';
      }
    }

    // Validação de itens (obrigatório para pedidos com valor)
    if (rules.requireItems) {
      if (!orderData.items || !Array.isArray(orderData.items) || orderData.items.length === 0) {
        errors.push('Orders with value must have at least one item');
        errorCode = 'MISSING_ITEMS';
      } else {
        // Validar cada item
        for (let i = 0; i < orderData.items.length; i++) {
          const item = orderData.items[i];
          const itemErrors = validateOrderItem(item, i);
          if (itemErrors.length > 0) {
            errors.push(...itemErrors);
            errorCode = 'INVALID_ITEMS';
          }
        }
      }
    }
  }

  // Validação específica para pedidos negativos/visitas
  if (isNegativeOrder) {
    if (!orderData.rejectionReason || orderData.rejectionReason.trim() === '') {
      errors.push('Rejection reason is required for negative orders');
      errorCode = 'MISSING_REJECTION_REASON';
    }
    
    // Para pedidos negativos, método de pagamento pode ser opcional
    console.log('ℹ️ [OrderValidation] Negative order detected, payment method validation skipped');
  }

  // Validação de datas
  if (!orderData.date) {
    errors.push('Order date is required');
    errorCode = 'MISSING_DATE';
  }

  const result: OrderValidationResult = {
    isValid: errors.length === 0,
    errors,
    errorCode
  };

  if (!result.isValid) {
    console.log('❌ [OrderValidation] Order validation failed:', {
      orderTotal: orderData.total,
      errorCode: result.errorCode,
      errors: result.errors
    });
  } else {
    console.log('✅ [OrderValidation] Order validation passed');
  }

  return result;
}

function validateOrderItem(item: any, index: number): string[] {
  const errors: string[] = [];

  if (!item.productName || item.productName.trim() === '') {
    errors.push(`Item ${index + 1}: Product name is required`);
  }

  if (!item.productCode) {
    errors.push(`Item ${index + 1}: Product code is required`);
  }

  if (!item.quantity || item.quantity <= 0) {
    errors.push(`Item ${index + 1}: Quantity must be greater than 0`);
  }

  if (!item.unitPrice || item.unitPrice < 0) {
    errors.push(`Item ${index + 1}: Unit price must be greater than or equal to 0`);
  }

  if (!item.total || item.total < 0) {
    errors.push(`Item ${index + 1}: Total must be greater than or equal to 0`);
  }

  return errors;
}

function isValidUUID(uuid: string): boolean {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
  return uuidRegex.test(uuid);
}

export function createValidationErrorResponse(validation: OrderValidationResult) {
  return {
    success: false,
    error: 'Order validation failed',
    errorCode: validation.errorCode,
    validationErrors: validation.errors,
    details: 'The mobile order contains invalid or missing data. Please fix the issues and try again.'
  };
}
