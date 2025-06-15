
import { useMemo } from 'react';
import { Order } from '@/types';
import { DatePeriod } from '@/types/dateFilter';
import { 
  isToday, 
  isYesterday, 
  isThisWeek, 
  isLastWeek, 
  isThisMonth, 
  isLastMonth 
} from '@/lib/date-utils';

export const useOrdersDateFilter = (orders: Order[]) => {
  const periodCounts = useMemo(() => {
    if (!orders || orders.length === 0) {
      return {
        all: 0,
        today: 0,
        yesterday: 0,
        this_week: 0,
        last_week: 0,
        this_month: 0,
        last_month: 0
      };
    }

    const counts = orders.reduce((acc, order) => {
      const orderDate = order.createdAt || order.date;
      
      if (isToday(orderDate)) acc.today++;
      if (isYesterday(orderDate)) acc.yesterday++;
      if (isThisWeek(orderDate)) acc.this_week++;
      if (isLastWeek(orderDate)) acc.last_week++;
      if (isThisMonth(orderDate)) acc.this_month++;
      if (isLastMonth(orderDate)) acc.last_month++;
      
      return acc;
    }, {
      all: orders.length,
      today: 0,
      yesterday: 0,
      this_week: 0,
      last_week: 0,
      this_month: 0,
      last_month: 0
    });

    return counts;
  }, [orders]);

  const filterOrdersByPeriod = useMemo(() => {
    return (orders: Order[], period: DatePeriod): Order[] => {
      if (!orders || period === 'all') return orders;

      return orders.filter(order => {
        const orderDate = order.createdAt || order.date;
        
        switch (period) {
          case 'today':
            return isToday(orderDate);
          case 'yesterday':
            return isYesterday(orderDate);
          case 'this_week':
            return isThisWeek(orderDate);
          case 'last_week':
            return isLastWeek(orderDate);
          case 'this_month':
            return isThisMonth(orderDate);
          case 'last_month':
            return isLastMonth(orderDate);
          default:
            return true;
        }
      });
    };
  }, []);

  return {
    periodCounts,
    filterOrdersByPeriod
  };
};
