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
    const result: any = {
      updated_at: new Date().toISOString()
    };

    // Only include fields that are present in the partial order
    if (order.id !== undefined) result.id = order.id;
    if (order.code !== undefined) result.code = order.code;
    if (order.customerId !== undefined) result.customer_id = order.customerId;
    if (order.customerName !== undefined) result.customer_name = order.customerName;
    if (order.salesRepId !== undefined) result.sales_rep_id = order.salesRepId;
    if (order.salesRepName !== undefined) result.sales_rep_name = order.salesRepName;
    if (order.date !== undefined) result.date = order.date.toISOString();
    if (order.dueDate !== undefined) result.due_date = order.dueDate.toISOString();
    if (order.deliveryDate !== undefined) result.delivery_date = order.deliveryDate?.toISOString();
    if (order.total !== undefined) result.total = order.total;
    if (order.discount !== undefined) result.discount = order.discount;
    if (order.status !== undefined) result.status = order.status;
    if (order.paymentStatus !== undefined) result.payment_status = order.paymentStatus;
    if (order.paymentMethod !== undefined) result.payment_method = order.paymentMethod;
    if (order.paymentMethodId !== undefined) result.payment_method_id = order.paymentMethodId;
    if (order.paymentTableId !== undefined) result.payment_table_id = order.paymentTableId;
    if (order.paymentTable !== undefined) result.payment_table = order.paymentTable;
    if (order.payments !== undefined) result.payments = order.payments;
    if (order.notes !== undefined) result.notes = order.notes;
    if (order.archived !== undefined) result.archived = order.archived;
    if (order.deliveryAddress !== undefined) result.delivery_address = order.deliveryAddress;
    if (order.deliveryCity !== undefined) result.delivery_city = order.deliveryCity;
    if (order.deliveryState !== undefined) result.delivery_state = order.deliveryState;
    if (order.deliveryZip !== undefined) result.delivery_zip = order.deliveryZip;
    if (order.importStatus !== undefined) result.import_status = order.importStatus;
    if (order.importedAt !== undefined) result.imported_at = order.importedAt?.toISOString();
    if (order.importedBy !== undefined) result.imported_by = order.importedBy;
    if (order.sourceProject !== undefined) result.source_project = order.sourceProject;
    if (order.mobileOrderId !== undefined) result.mobile_order_id = order.mobileOrderId;
    if (order.rejectionReason !== undefined) result.rejection_reason = order.rejectionReason;
    if (order.visitNotes !== undefined) result.visit_notes = order.visitNotes;

    return result;
  }
}
