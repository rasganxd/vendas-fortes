
import { Payment } from '@/types';
import { mockOrders } from './orders';
import { currentDate } from '../utils/mock-utils';

// Mock Payments data
export const mockPayments: Payment[] = mockOrders
  .filter(order => order.paymentStatus !== 'pending')
  .map(order => {
    const isPaid = order.paymentStatus === 'paid';
    const amount = isPaid ? order.total : order.total * 0.5;
    const methods = ['cash', 'credit', 'debit', 'transfer', 'check'] as const;
    
    return {
      id: `pay-${order.id}`,
      orderId: order.id,
      amount: amount,
      method: methods[Math.floor(Math.random() * methods.length)],
      status: 'completed',
      date: new Date(order.createdAt),
      notes: Math.random() > 0.8 ? 'Pagamento confirmado' : "",
      createdAt: new Date(order.createdAt),
      updatedAt: currentDate
    };
  });
