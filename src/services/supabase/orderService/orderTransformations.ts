
import { Order } from '@/types';

export class OrderTransformations {
  static transformFromDB(dbRecord: any): Order {
    if (!dbRecord) return dbRecord;
    
    return {
      id: dbRecord.id,
      code: dbRecord.code,
      customerId: dbRecord.customer_id || '',
      customerName: dbRecord.customer_name || '',
      salesRepId: dbRecord.sales_rep_id || '',
      salesRepName: dbRecord.sales_rep_name || '',
      date: dbRecord.date ? new Date(dbRecord.date) : new Date(),
      total: dbRecord.total || 0,
      discount: dbRecord.discount || 0,
      status: dbRecord.status || 'pending',
      paymentStatus: dbRecord.payment_status || 'pending',
      paymentMethod: dbRecord.payment_method || '',
      paymentMethodId: dbRecord.payment_method_id || '',
      paymentTableId: dbRecord.payment_table_id || '',
      payments: dbRecord.payments || [],
      archived: dbRecord.archived || false,
      dueDate: dbRecord.due_date ? new Date(dbRecord.due_date) : new Date(),
      deliveryAddress: dbRecord.delivery_address || '',
      deliveryCity: dbRecord.delivery_city || '',
      deliveryState: dbRecord.delivery_state || '',
      deliveryZip: dbRecord.delivery_zip || '',
      notes: dbRecord.notes || '',
      createdAt: dbRecord.created_at ? new Date(dbRecord.created_at) : new Date(),
      updatedAt: dbRecord.updated_at ? new Date(dbRecord.updated_at) : new Date(),
      items: dbRecord.items || [],
      importStatus: dbRecord.import_status || 'pending',
      importedAt: dbRecord.imported_at ? new Date(dbRecord.imported_at) : undefined,
      importedBy: dbRecord.imported_by || undefined,
      sourceProject: dbRecord.source_project || 'admin',
      mobileOrderId: dbRecord.mobile_order_id || undefined
    };
  }

  static transformToDB(record: Partial<Order>): any {
    if (!record) return record;
    
    const dbRecord = {
      code: record.code,
      customer_id: record.customerId,
      customer_name: record.customerName,
      sales_rep_id: record.salesRepId,
      sales_rep_name: record.salesRepName,
      date: record.date ? record.date.toISOString() : null,
      total: record.total,
      discount: record.discount,
      status: record.status || 'pending',
      payment_status: record.paymentStatus || 'pending',
      payment_method: record.paymentMethod,
      payment_method_id: record.paymentMethodId || null,
      payment_table_id: record.paymentTableId || null,
      due_date: record.dueDate ? record.dueDate.toISOString() : null,
      delivery_address: record.deliveryAddress,
      delivery_city: record.deliveryCity,
      delivery_state: record.deliveryState,
      delivery_zip: record.deliveryZip,
      notes: record.notes,
      import_status: record.importStatus,
      imported_at: record.importedAt ? record.importedAt.toISOString() : null,
      imported_by: record.importedBy,
      source_project: record.sourceProject,
      mobile_order_id: record.mobileOrderId
    };

    console.log("📝 Transform to DB result:", dbRecord);
    return dbRecord;
  }
}
