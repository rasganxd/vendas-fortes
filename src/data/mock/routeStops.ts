
import { RouteStop } from '@/types';
import { mockOrders } from './orders';
import { mockCustomers } from './customers';
import { randomFutureDate } from '../utils/mock-utils';

// Mock Route Stops
export const mockStops: RouteStop[] = mockOrders
  .filter(order => order.status === 'confirmed')
  .map((order, index) => {
    const customer = mockCustomers.find(c => c.id === order.customerId) || mockCustomers[0];
    
    return {
      id: `stop-${order.id}`,
      orderId: order.id,
      customerId: customer.id,
      customerName: customer.name,
      address: customer.address || "",
      city: customer.city || "",
      state: customer.state || "",
      zip: customer.zip || "",
      zipCode: customer.zipCode || "",
      lat: 0,
      lng: 0,
      sequence: index + 1,
      position: index + 1, // For compatibility
      status: 'pending' as const,
      completed: false
    };
  });
