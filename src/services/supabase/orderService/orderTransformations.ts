
import { Order } from '@/types';

export class OrderTransformations {
  static transformFromDB(dbRecord: any): Order {
    return {
      id: dbRecord.id,
      code: dbRecord.code,
      customerId: dbRecord.customer_id,
      customerName: dbRecord.customer_name,
      salesRepId: dbRecord.sales_rep_id,
      salesRepName: dbRecord.sales_rep_name,
      date: new Date(dbRecord.date),
      dueDate: dbRecord.due_date ? new Date(dbRecord.due_date) : new Date(),
      deliveryDate: dbRecord.delivery_date ? new Date(dbRecord.delivery_date) : undefined,
      items: dbRecord.order_items?.map((item: any) => ({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_code?.toString() || '',
        productName: item.product_name,
        productCode: item.product_code || 0,
        quantity: item.quantity,
        unitPrice: item.unit_price || item.price,
        price: item.price,
        discount: item.discount || 0,
        total: item.total,
        unit: item.unit || 'UN'
      })) || [],
      total: dbRecord.total,
      discount: dbRecord.discount || 0,
      status: dbRecord.status,
      paymentStatus: dbRecord.payment_status,
      paymentMethod: dbRecord.payment_method,
      paymentMethodId: dbRecord.payment_method_id,
      paymentTableId: dbRecord.payment_table_id,
      paymentTable: dbRecord.payment_table,
      payments: dbRecord.payments || [],
      notes: dbRecord.notes || '',
      createdAt: new Date(dbRecord.created_at),
      updatedAt: new Date(dbRecord.updated_at),
      archived: dbRecord.archived || false,
      deliveryAddress: dbRecord.delivery_address || '',
      deliveryCity: dbRecord.delivery_city || '',
      deliveryState: dbRecord.delivery_state || '',
      deliveryZip: dbRecord.delivery_zip || '',
      sourceProject: dbRecord.source_project || 'admin',
      mobileOrderId: dbRecord.mobile_order_id,
      importStatus: dbRecord.import_status || 'imported',
      importedAt: dbRecord.imported_at ? new Date(dbRecord.imported_at) : undefined,
      importedBy: dbRecord.imported_by
    };
  }

  static transformToDB(record: Partial<Order>): any {
    const dbRecord: any = {};

    if (record.customerId !== undefined) dbRecord.customer_id = record.customerId;
    if (record.customerName !== undefined) dbRecord.customer_name = record.customerName;
    if (record.salesRepId !== undefined) dbRecord.sales_rep_id = record.salesRepId;
    if (record.salesRepName !== undefined) dbRecord.sales_rep_name = record.salesRepName;
    if (record.date !== undefined) dbRecord.date = record.date.toISOString();
    if (record.dueDate !== undefined) dbRecord.due_date = record.dueDate.toISOString();
    if (record.deliveryDate !== undefined) dbRecord.delivery_date = record.deliveryDate.toISOString();
    if (record.total !== undefined) dbRecord.total = record.total;
    if (record.discount !== undefined) dbRecord.discount = record.discount;
    if (record.status !== undefined) dbRecord.status = record.status;
    if (record.paymentStatus !== undefined) dbRecord.payment_status = record.paymentStatus;
    if (record.paymentMethod !== undefined) dbRecord.payment_method = record.paymentMethod;
    if (record.paymentMethodId !== undefined) dbRecord.payment_method_id = record.paymentMethodId;
    if (record.paymentTableId !== undefined) dbRecord.payment_table_id = record.paymentTableId;
    if (record.paymentTable !== undefined) dbRecord.payment_table = record.paymentTable;
    if (record.payments !== undefined) dbRecord.payments = record.payments;
    if (record.notes !== undefined) dbRecord.notes = record.notes;
    if (record.archived !== undefined) dbRecord.archived = record.archived;
    if (record.deliveryAddress !== undefined) dbRecord.delivery_address = record.deliveryAddress;
    if (record.deliveryCity !== undefined) dbRecord.delivery_city = record.deliveryCity;
    if (record.deliveryState !== undefined) dbRecord.delivery_state = record.deliveryState;
    if (record.deliveryZip !== undefined) dbRecord.delivery_zip = record.deliveryZip;
    if (record.sourceProject !== undefined) dbRecord.source_project = record.sourceProject;
    if (record.mobileOrderId !== undefined) dbRecord.mobile_order_id = record.mobileOrderId;
    if (record.importStatus !== undefined) dbRecord.import_status = record.importStatus;
    if (record.importedAt !== undefined) dbRecord.imported_at = record.importedAt.toISOString();
    if (record.importedBy !== undefined) dbRecord.imported_by = record.importedBy;

    return dbRecord;
  }
}
