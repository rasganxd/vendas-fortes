import { Order, OrderItem } from '@/types';

export class OrderTransformations {
  static transformFromDB(orderData: any): Order {
    return {
      id: orderData.id,
      code: orderData.code,
      customerId: orderData.customer_id || '',
      customerName: orderData.customer_name || '',
      customerCode: orderData.customer_code,
      salesRepId: orderData.sales_rep_id || '',
      salesRepName: orderData.sales_rep_name || '',
      date: new Date(orderData.date),
      dueDate: new Date(orderData.due_date || orderData.date),
      deliveryDate: orderData.delivery_date ? new Date(orderData.delivery_date) : undefined,
      items: orderData.items || [],
      total: Number(orderData.total || 0),
      discount: Number(orderData.discount || 0),
      status: orderData.status || 'pending',
      paymentStatus: orderData.payment_status || 'pending',
      paymentMethod: orderData.payment_method || '',
      paymentMethodId: orderData.payment_method_id || '',
      paymentTableId: orderData.payment_table_id || '',
      paymentTable: orderData.payment_table,
      payments: orderData.payments || [],
      notes: orderData.notes || '',
      createdAt: new Date(orderData.created_at),
      updatedAt: new Date(orderData.updated_at),
      archived: orderData.archived || false,
      deliveryAddress: orderData.delivery_address || '',
      deliveryCity: orderData.delivery_city || '',
      deliveryState: orderData.delivery_state || '',
      deliveryZip: orderData.delivery_zip || '',
      importStatus: orderData.import_status || 'pending',
      importedAt: orderData.imported_at ? new Date(orderData.imported_at) : undefined,
      importedBy: orderData.imported_by,
      sourceProject: orderData.source_project || 'admin',
      mobileOrderId: orderData.mobile_order_id,
      rejectionReason: orderData.rejection_reason,
      visitNotes: orderData.visit_notes
    };
  }

  static transformFromMobileOrder(mobileOrderData: any): Order {
    console.log('🔄 [OrderTransformations] Transforming mobile order:', {
      id: mobileOrderData.id,
      code: mobileOrderData.code,
      total: mobileOrderData.total,
      customerId: mobileOrderData.customer_id,
      salesRepId: mobileOrderData.sales_rep_id,
      status: mobileOrderData.status
    });

    try {
      // Validate required fields
      if (!mobileOrderData.id) {
        throw new Error('Mobile order ID is required');
      }

      if (!mobileOrderData.code) {
        throw new Error('Mobile order code is required');
      }

      // Ensure we have valid customer and sales rep data
      const customerId = mobileOrderData.customer_id || '';
      const customerName = mobileOrderData.customer_name || 'Cliente sem nome';
      const salesRepId = mobileOrderData.sales_rep_id || '';
      const salesRepName = mobileOrderData.sales_rep_name || 'Vendedor sem nome';

      if (!customerId && !customerName) {
        console.warn('⚠️ [OrderTransformations] Mobile order missing customer data:', mobileOrderData.id);
      }

      if (!salesRepId && !salesRepName) {
        console.warn('⚠️ [OrderTransformations] Mobile order missing sales rep data:', mobileOrderData.id);
      }

      // Parse dates safely
      let orderDate: Date;
      try {
        orderDate = new Date(mobileOrderData.date || mobileOrderData.created_at);
        if (isNaN(orderDate.getTime())) {
          orderDate = new Date();
        }
      } catch (error) {
        console.warn('⚠️ [OrderTransformations] Invalid date, using current date:', error);
        orderDate = new Date();
      }

      let dueDate: Date;
      try {
        dueDate = new Date(mobileOrderData.due_date || mobileOrderData.date || mobileOrderData.created_at);
        if (isNaN(dueDate.getTime())) {
          dueDate = orderDate;
        }
      } catch (error) {
        console.warn('⚠️ [OrderTransformations] Invalid due date, using order date:', error);
        dueDate = orderDate;
      }

      // Parse numeric values safely
      const total = Number(mobileOrderData.total || 0);
      const discount = Number(mobileOrderData.discount || 0);
      const customerCode = mobileOrderData.customer_code ? Number(mobileOrderData.customer_code) : undefined;

      // Determine import status
      const importStatus = mobileOrderData.imported_to_orders ? 'imported' : 'pending';

      const transformedOrder: Order = {
        id: mobileOrderData.id,
        code: Number(mobileOrderData.code),
        customerId,
        customerName,
        customerCode,
        salesRepId,
        salesRepName,
        date: orderDate,
        dueDate: dueDate,
        deliveryDate: mobileOrderData.delivery_date ? new Date(mobileOrderData.delivery_date) : undefined,
        items: mobileOrderData.items || [],
        total,
        discount,
        status: mobileOrderData.status || 'pending',
        paymentStatus: mobileOrderData.payment_status || 'pending',
        paymentMethod: mobileOrderData.payment_method || '',
        paymentMethodId: mobileOrderData.payment_method_id || '',
        paymentTableId: mobileOrderData.payment_table_id || '',
        paymentTable: mobileOrderData.payment_table || '',
        payments: mobileOrderData.payments || [],
        notes: mobileOrderData.notes || '',
        createdAt: new Date(mobileOrderData.created_at),
        updatedAt: new Date(mobileOrderData.updated_at),
        archived: false,
        deliveryAddress: mobileOrderData.delivery_address || '',
        deliveryCity: mobileOrderData.delivery_city || '',
        deliveryState: mobileOrderData.delivery_state || '',
        deliveryZip: mobileOrderData.delivery_zip || '',
        importStatus,
        importedAt: mobileOrderData.imported_at ? new Date(mobileOrderData.imported_at) : undefined,
        importedBy: mobileOrderData.imported_by,
        sourceProject: 'mobile',
        mobileOrderId: mobileOrderData.mobile_order_id || mobileOrderData.id,
        rejectionReason: mobileOrderData.rejection_reason,
        visitNotes: mobileOrderData.visit_notes
      };

      console.log('✅ [OrderTransformations] Successfully transformed mobile order:', {
        id: transformedOrder.id,
        code: transformedOrder.code,
        total: transformedOrder.total,
        importStatus: transformedOrder.importStatus
      });

      return transformedOrder;
    } catch (error) {
      console.error('❌ [OrderTransformations] Error transforming mobile order:', error);
      console.error('❌ [OrderTransformations] Original data:', mobileOrderData);
      throw new Error(`Failed to transform mobile order ${mobileOrderData.id}: ${error.message}`);
    }
  }

  static transformToDB(order: Partial<Order>): any {
    console.log('🔄 [OrderTransformations] Converting order to DB format:', {
      customerId: order.customerId,
      salesRepId: order.salesRepId,
      paymentMethodId: order.paymentMethodId,
      paymentTableId: order.paymentTableId
    });

    const result: any = {
      updated_at: new Date().toISOString()
    };

    // Helper function to handle UUID fields - convert empty strings to null
    const processUUID = (value: string | undefined): string | null => {
      if (value === undefined) return undefined;
      if (value === '' || value === null) return null;
      return value;
    };

    // Helper function to handle non-UUID strings - allow empty strings
    const processString = (value: string | undefined): string | undefined => {
      return value;
    };

    // Only include fields that are present in the partial order
    if (order.id !== undefined) result.id = order.id;
    if (order.code !== undefined) result.code = order.code;
    
    // UUID fields - convert empty strings to null
    if (order.customerId !== undefined) result.customer_id = processUUID(order.customerId);
    if (order.salesRepId !== undefined) result.sales_rep_id = processUUID(order.salesRepId);
    if (order.paymentMethodId !== undefined) result.payment_method_id = processUUID(order.paymentMethodId);
    if (order.paymentTableId !== undefined) result.payment_table_id = processUUID(order.paymentTableId);
    
    // String fields - allow empty strings
    if (order.customerName !== undefined) result.customer_name = processString(order.customerName);
    if (order.salesRepName !== undefined) result.sales_rep_name = processString(order.salesRepName);
    if (order.paymentMethod !== undefined) result.payment_method = processString(order.paymentMethod);
    if (order.paymentTable !== undefined) result.payment_table = processString(order.paymentTable);
    if (order.notes !== undefined) result.notes = processString(order.notes);
    if (order.deliveryAddress !== undefined) result.delivery_address = processString(order.deliveryAddress);
    if (order.deliveryCity !== undefined) result.delivery_city = processString(order.deliveryCity);
    if (order.deliveryState !== undefined) result.delivery_state = processString(order.deliveryState);
    if (order.deliveryZip !== undefined) result.delivery_zip = processString(order.deliveryZip);
    if (order.importedBy !== undefined) result.imported_by = processString(order.importedBy);
    if (order.sourceProject !== undefined) result.source_project = processString(order.sourceProject);
    if (order.mobileOrderId !== undefined) result.mobile_order_id = processString(order.mobileOrderId);
    if (order.rejectionReason !== undefined) result.rejection_reason = processString(order.rejectionReason);
    if (order.visitNotes !== undefined) result.visit_notes = processString(order.visitNotes);
    if (order.importStatus !== undefined) result.import_status = processString(order.importStatus);
    
    // Date fields
    if (order.date !== undefined) result.date = order.date.toISOString();
    if (order.dueDate !== undefined) result.due_date = order.dueDate.toISOString();
    if (order.deliveryDate !== undefined) result.delivery_date = order.deliveryDate?.toISOString();
    if (order.importedAt !== undefined) result.imported_at = order.importedAt?.toISOString();
    
    // Numeric and boolean fields
    if (order.total !== undefined) result.total = order.total;
    if (order.discount !== undefined) result.discount = order.discount;
    if (order.archived !== undefined) result.archived = order.archived;
    
    // Status fields
    if (order.status !== undefined) result.status = order.status;
    if (order.paymentStatus !== undefined) result.payment_status = order.paymentStatus;
    
    // Note: 'payments' is stored in a separate 'payments' table, not as a column in 'orders'
    // Do NOT include order.payments in DB transformation

    console.log('✅ [OrderTransformations] DB format conversion completed:', {
      customer_id: result.customer_id,
      sales_rep_id: result.sales_rep_id,
      payment_method_id: result.payment_method_id,
      payment_table_id: result.payment_table_id
    });

    return result;
  }
}
