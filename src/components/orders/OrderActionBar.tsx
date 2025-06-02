
import React from 'react';
import { Button } from '@/components/ui/button';
import { Loader, ShoppingCart, Search } from 'lucide-react';
import { InlineSavingIndicator } from '@/components/ui/saving-indicator';
import { Customer, SalesRep, OrderItem } from '@/types';
import { ConnectionStatus } from '@/context/AppContextTypes';
import { Card, CardContent } from "@/components/ui/card";

interface OrderActionBarProps {
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

export default function OrderActionBar({
  selectedCustomer,
  selectedSalesRep,
  orderItems,
  isSubmitting,
  isSaving = false,
  isEditMode,
  connectionStatus,
  handleViewRecentPurchases,
  handleCreateOrder
}: OrderActionBarProps) {
  const canCreateOrder = selectedCustomer && selectedSalesRep && orderItems.length > 0 && connectionStatus !== 'offline';
  const isOffline = connectionStatus === 'offline';

  return (
    <Card className="sticky top-0 z-20 shadow-md border-blue-200 bg-blue-50/80 backdrop-blur-sm">
      <CardContent className="py-3">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={handleViewRecentPurchases}
              disabled={!selectedCustomer || isSubmitting}
              className="transition-colors bg-white hover:bg-blue-50 border-blue-200"
            >
              <Search size={16} className="mr-2" />
              Compras Recentes
            </Button>
            
            {isOffline && (
              <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-md border border-orange-200">
                Modo Offline
              </div>
            )}
          </div>

          <div className="flex items-center space-x-3 w-full sm:w-auto">
            <InlineSavingIndicator 
              isVisible={isSaving} 
              message={isEditMode ? "Salvando alterações..." : "Criando pedido..."}
            />
            
            <Button
              onClick={handleCreateOrder}
              disabled={!canCreateOrder || isSubmitting}
              className="min-w-[140px] transition-all duration-200 hover:scale-105 bg-green-600 hover:bg-green-700 w-full sm:w-auto"
              size="lg"
            >
              {isSubmitting ? (
                <div className="flex items-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>{isEditMode ? 'Salvando...' : 'Criando...'}</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <ShoppingCart size={16} />
                  <span>{isEditMode ? 'Salvar Pedido' : 'Criar Pedido'}</span>
                </div>
              )}
            </Button>
          </div>
        </div>

        {/* Quick Status Indicators */}
        <div className="flex flex-wrap gap-2 mt-3 pt-3 border-t border-blue-200">
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${selectedSalesRep ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-gray-600">Vendedor</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${selectedCustomer ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-gray-600">Cliente</span>
          </div>
          <div className="flex items-center gap-2 text-xs">
            <span className={`w-2 h-2 rounded-full ${orderItems.length > 0 ? 'bg-green-500' : 'bg-red-500'}`}></span>
            <span className="text-gray-600">{orderItems.length} item(s)</span>
          </div>
          {canCreateOrder && (
            <div className="flex items-center gap-2 text-xs font-medium text-green-700">
              <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></span>
              <span>Pronto para finalizar</span>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
