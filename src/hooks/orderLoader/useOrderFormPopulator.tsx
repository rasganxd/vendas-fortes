
import { Customer, SalesRep, Order } from '@/types';

export const useOrderFormPopulator = (
  customers: Customer[],
  salesReps: SalesRep[],
  paymentTables: any[],
  setSelectedCustomer: (customer: Customer | null) => void,
  setSelectedSalesRep: (salesRep: SalesRep | null) => void,
  setOrderItems: (items: any[]) => void,
  setSelectedPaymentTable: (id: string) => void,
  setCustomerInputValue: (value: string) => void,
  setSalesRepInputValue: (value: string) => void,
  setIsEditMode: (mode: boolean) => void,
  setCurrentOrderId: (id: string | null) => void,
  setOriginalOrder: (order: Order | null) => void
) => {
  const populateOrderForm = (order: Order, orderId: string, validatedItems: any[]) => {
    console.log("📋 Order loaded successfully:", order.id);
    
    // Set edit mode and store order
    setIsEditMode(true);
    setCurrentOrderId(orderId);
    setOriginalOrder(order);
    
    // Load customer
    const customer = customers.find(c => c.id === order.customerId);
    if (customer) {
      console.log("✅ Customer found and set:", customer.name);
      setSelectedCustomer(customer);
      const displayValue = customer.code ? `${customer.code} - ${customer.name}` : customer.name;
      setCustomerInputValue(displayValue);
    } else {
      console.warn("⚠️ Customer not found for ID:", order.customerId);
      if (order.customerName) {
        setCustomerInputValue(order.customerName);
      }
    }
    
    // Load sales rep
    const salesRep = salesReps.find(s => s.id === order.salesRepId);
    if (salesRep) {
      console.log("✅ Sales rep found and set:", salesRep.name);
      setSelectedSalesRep(salesRep);
      const displayValue = salesRep.code ? `${salesRep.code} - ${salesRep.name}` : salesRep.name;
      setSalesRepInputValue(displayValue);
    } else {
      console.warn("⚠️ Sales rep not found for ID:", order.salesRepId);
      if (order.salesRepName) {
        setSalesRepInputValue(order.salesRepName);
      }
    }
    
    // Load order items
    setOrderItems(validatedItems);
    console.log("✅ Order items loaded:", validatedItems.length);
    
    // Set payment table
    if (order.paymentTableId) {
      const tableExists = paymentTables.some(pt => pt.id === order.paymentTableId);
      if (tableExists) {
        setSelectedPaymentTable(order.paymentTableId);
      } else {
        setSelectedPaymentTable(paymentTables.length > 0 ? paymentTables[0].id : 'default-table');
      }
    }
  };

  return { populateOrderForm };
};
