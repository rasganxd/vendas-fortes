
import React, { useState } from 'react';
import { Customer, Order } from '@/types';
import { toast } from '@/hooks/use-toast';
import RecentPurchasesDialog from './RecentPurchasesDialog';

interface RecentPurchasesManagerProps {
  selectedCustomer: Customer | null;
  orders: Order[];
}

export default function RecentPurchasesManager({
  selectedCustomer,
  orders
}: RecentPurchasesManagerProps) {
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

export { RecentPurchasesManager };
