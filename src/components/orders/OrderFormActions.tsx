
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
      {/* Main Action Button - Destacado */}
      <div className="space-y-2">
        <Button
          onClick={handleCreateOrder}
          disabled={!canCreateOrder || isSubmitting}
          className="w-full min-h-[48px] text-base font-semibold transition-all duration-200 hover:scale-[1.02] shadow-lg"
          size="lg"
        >
          {isSubmitting ? (
            <div className="flex items-center space-x-2">
              <Loader className="h-5 w-5 animate-spin" />
              <span>{isEditMode ? 'Salvando...' : 'Criando...'}</span>
            </div>
          ) : (
            isEditMode ? 'Salvar Pedido' : 'Criar Pedido'
          )}
        </Button>

        {/* Saving indicator right below main button */}
        <InlineSavingIndicator 
          isVisible={isSaving} 
          message={isEditMode ? "Salvando alterações..." : "Criando pedido..."}
        />
      </div>

      {/* Secondary Actions - Mais compacto */}
      <div className="flex flex-col sm:flex-row gap-2">
        <Button
          type="button"
          variant="outline"
          onClick={handleViewRecentPurchases}
          disabled={!selectedCustomer || isSubmitting}
          className="flex-1 transition-colors"
          size="sm"
        >
          Compras Recentes
        </Button>
        
        {isOffline && (
          <div className="text-xs text-orange-600 bg-orange-50 px-2 py-1 rounded text-center">
            Modo Offline
          </div>
        )}
      </div>

      {/* Status indicator - Mais compacto */}
      <div className="text-xs text-center">
        {canCreateOrder ? (
          <span className="text-green-600 font-medium">✓ Pronto para {isEditMode ? 'salvar' : 'criar'}</span>
        ) : (
          <span className="text-orange-600">
            Faltam: {!selectedCustomer && 'Cliente'} {!selectedCustomer && !selectedSalesRep && ', '} 
            {!selectedSalesRep && 'Vendedor'} {(!selectedCustomer || !selectedSalesRep) && orderItems.length === 0 && ', '}
            {orderItems.length === 0 && 'Itens'}
          </span>
        )}
      </div>
    </div>
  );
}
