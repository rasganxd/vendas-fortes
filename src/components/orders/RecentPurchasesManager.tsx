
import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Customer, Order } from '@/types';
import { toast } from '@/hooks/use-toast';
import RecentPurchasesDialog from './RecentPurchasesDialog';

interface RecentPurchasesManagerProps {
  selectedCustomer: Customer | null;
  orders: Order[];
}

export interface RecentPurchasesManagerRef {
  handleViewRecentPurchases: () => void;
}

const RecentPurchasesManager = forwardRef<RecentPurchasesManagerRef, RecentPurchasesManagerProps>(
  ({ selectedCustomer, orders }, ref) => {
    const [isRecentPurchasesDialogOpen, setIsRecentPurchasesDialogOpen] = useState(false);

    const getRecentCustomerOrders = () => {
      if (!selectedCustomer) return [];
      
      return orders
        .filter(order => order.customerId === selectedCustomer.id)
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
    };

    const handleViewRecentPurchases = () => {
      if (selectedCustomer) {
        setIsRecentPurchasesDialogOpen(true);
      } else {
        toast({
          title: "Atenção",
          description: "Selecione um cliente primeiro para ver compras recentes."
        });
      }
    };

    useImperativeHandle(ref, () => ({
      handleViewRecentPurchases
    }));

    return (
      <>
        <RecentPurchasesDialog
          open={isRecentPurchasesDialogOpen}
          onOpenChange={setIsRecentPurchasesDialogOpen}
          customer={selectedCustomer}
          recentOrders={getRecentCustomerOrders()}
        />
      </>
    );
  }
);

RecentPurchasesManager.displayName = 'RecentPurchasesManager';

export default RecentPurchasesManager;
export { RecentPurchasesManager };
