
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader } from 'lucide-react';
import { InlineSavingIndicator } from '@/components/ui/saving-indicator';
import { Customer, SalesRep, OrderItem } from '@/types';
import { ConnectionStatus } from '@/context/AppContextTypes';

interface OrderFormActionsProps {
  selectedCustomer: Customer | null;
  selectedSalesRep: SalesRep | null;
  orderItems: OrderItem[];
  isSubmitting: boolean;
  isSaving?: boolean;
  isEditMode: boolean;
  connectionStatus: ConnectionStatus;
  handleViewRecentPurchases: () => void;
  handleCreateOrder: () => Promise<void>;
}

export default function OrderFormActions({
  selectedCustomer,
  selectedSalesRep,
  orderItems,
  isSubmitting,
  isSaving = false,
  isEditMode,
  connectionStatus,
  handleViewRecentPurchases,
  handleCreateOrder
}: OrderFormActionsProps) {
  const canCreateOrder = selectedCustomer && selectedSalesRep && orderItems.length > 0 && connectionStatus !== 'offline';
  const isOffline = connectionStatus === 'offline';

  return (
    <div className="flex justify-between items-center">
      <div className="flex space-x-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleViewRecentPurchases}
          disabled={!selectedCustomer || isSubmitting}
          className="transition-colors"
        >
          Compras Recentes
        </Button>
        
        {isOffline && (
          <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-md">
            Modo Offline
          </div>
        )}
      </div>

      <div className="flex items-center space-x-3">
        <InlineSavingIndicator 
          isVisible={isSaving} 
          message={isEditMode ? "Salvando alterações..." : "Criando pedido..."}
        />
        
        <Button
          onClick={handleCreateOrder}
          disabled={!canCreateOrder || isSubmitting}
          className="min-w-[120px] transition-all duration-200 hover:scale-105"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <Loader className="h-4 w-4 animate-spin" />
              <span>{isEditMode ? 'Salvando...' : 'Criando...'}</span>
            </div>
          ) : (
            isEditMode ? 'Salvar Pedido' : 'Criar Pedido'
          )}
        </Button>
      </div>
    </div>
  );
}
