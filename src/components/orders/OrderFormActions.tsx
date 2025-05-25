
import React from 'react';
import { Customer, SalesRep, OrderItem } from '@/types';
import { ConnectionStatus as ConnectionStatusType } from '@/context/AppContextTypes';
import { Button } from "@/components/ui/button";
import { Save, ClipboardList } from "lucide-react";

interface OrderFormActionsProps {
  selectedCustomer: Customer | null;
  selectedSalesRep: SalesRep | null;
  orderItems: OrderItem[];
  isSubmitting: boolean;
  isEditMode: boolean;
  connectionStatus: ConnectionStatusType;
  handleViewRecentPurchases: () => void;
  handleCreateOrder: () => Promise<void>;
}

export default function OrderFormActions({
  selectedCustomer,
  selectedSalesRep,
  orderItems,
  isSubmitting,
  isEditMode,
  connectionStatus,
  handleViewRecentPurchases,
  handleCreateOrder
}: OrderFormActionsProps) {
  const getConnectionStatusColor = () => {
    switch (connectionStatus) {
      case 'online':
        return 'bg-green-500 hover:bg-green-600';
      case 'offline':
        return 'bg-amber-500 hover:bg-amber-600';
      case 'connecting':
        return 'bg-blue-500 hover:bg-blue-600';
      case 'error':
        return 'bg-red-500 hover:bg-red-600';
      default:
        return 'bg-gray-500 hover:bg-gray-600';
    }
  };

  return (
    <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-2">
      <Button 
        onClick={handleViewRecentPurchases} 
        variant="outline" 
        size="sm"
        className="border-dashed border-gray-300 hover:border-gray-400 text-gray-700" 
        disabled={!selectedCustomer}
      >
        <ClipboardList size={16} className="mr-2" />
        Compras Recentes
      </Button>
      
      <Button 
        onClick={handleCreateOrder} 
        disabled={isSubmitting || !selectedCustomer || !selectedSalesRep || orderItems.length === 0} 
        size="sm"
        className={`sm:w-40 text-white ${getConnectionStatusColor()}`}
      >
        <Save size={16} className="mr-2" />
        {isSubmitting ? 'Salvando...' : isEditMode ? 'Atualizar' : 'Finalizar'}
      </Button>
    </div>
  );
}
