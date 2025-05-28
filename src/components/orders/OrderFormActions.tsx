
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
    <div className="space-y-3">
      {/* Action Buttons */}
      <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
        <div className="flex flex-col sm:flex-row space-y-2 sm:space-y-0 sm:space-x-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleViewRecentPurchases}
            disabled={!selectedCustomer || isSubmitting}
            className="transition-colors w-full sm:w-auto"
          >
            Compras Recentes
          </Button>
          
          {isOffline && (
            <div className="text-sm text-orange-600 bg-orange-50 px-3 py-2 rounded-md text-center sm:text-left">
              Modo Offline
            </div>
          )}
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center space-y-2 sm:space-y-0 sm:space-x-3">
          <InlineSavingIndicator 
            isVisible={isSaving} 
            message={isEditMode ? "Salvando alterações..." : "Criando pedido..."}
          />
          
          <Button
            onClick={handleCreateOrder}
            disabled={!canCreateOrder || isSubmitting}
            className="min-w-[120px] transition-all duration-200 hover:scale-105 w-full sm:w-auto"
            size="lg"
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

      {/* Status indicator for validation */}
      <div className="text-xs text-gray-500 text-center">
        {canCreateOrder ? (
          <span className="text-green-600">✓ Pedido pronto para {isEditMode ? 'salvar' : 'criar'}</span>
        ) : (
          <span className="text-orange-600">
            Preencha: {!selectedCustomer && 'Cliente'} {!selectedCustomer && !selectedSalesRep && ', '} 
            {!selectedSalesRep && 'Vendedor'} {(!selectedCustomer || !selectedSalesRep) && orderItems.length === 0 && ', '}
            {orderItems.length === 0 && 'Itens'}
          </span>
        )}
      </div>
    </div>
  );
}
