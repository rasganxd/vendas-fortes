import React from 'react';
import { OrderItem, Customer, SalesRep } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { ShoppingCart, User, UserCheck, CreditCard, Package, Calculator, Search, Loader } from 'lucide-react';
import { ConnectionStatus } from '@/context/AppContextTypes';
interface OrderSummaryPanelProps {
  orderItems: OrderItem[];
  selectedCustomer: Customer | null;
  selectedSalesRep: SalesRep | null;
  selectedPaymentTable: string;
  calculateTotal: () => number;
  isEditMode: boolean;
  // Action button props
  isSubmitting: boolean;
  isSaving: boolean;
  connectionStatus: ConnectionStatus;
  handleViewRecentPurchases: () => void;
  handleCreateOrder: () => Promise<void>;
}
export default function OrderSummaryPanel({
  orderItems,
  selectedCustomer,
  selectedSalesRep,
  selectedPaymentTable,
  calculateTotal,
  isEditMode,
  isSubmitting,
  isSaving,
  connectionStatus,
  handleViewRecentPurchases,
  handleCreateOrder
}: OrderSummaryPanelProps) {
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = calculateTotal();
  const canCreateOrder = selectedCustomer && selectedSalesRep && orderItems.length > 0 && connectionStatus !== 'offline';
  const isOffline = connectionStatus === 'offline';
  return <div className="space-y-4">
      {/* Order Status */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Calculator size={20} />
            Resumo do Pedido
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Main Totals */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600 flex items-center gap-2">
                <Package size={16} />
                Total de Itens:
              </span>
              <Badge variant="secondary" className="font-bold">
                {totalItems}
              </Badge>
            </div>
            
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-600">Produtos Únicos:</span>
              <Badge variant="outline">
                {orderItems.length}
              </Badge>
            </div>
            
            <Separator />
            
            <div className="flex items-center justify-between">
              <span className="font-medium text-gray-800 text-sm">Valor Total:</span>
              <span className="font-bold text-green-600 text-lg">
                {totalValue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
              </span>
            </div>
          </div>

          <Separator />

          {/* Action Buttons */}
          <div className="space-y-3">
            <Button type="button" variant="outline" onClick={handleViewRecentPurchases} disabled={!selectedCustomer || isSubmitting} className="w-full transition-colors bg-white hover:bg-blue-50 border-blue-200">
              <Search size={16} className="mr-2" />
              Últimas Compras
            </Button>

            {isOffline && <div className="text-sm text-orange-600 bg-orange-50 px-3 py-1 rounded-md border border-orange-200 text-center">
                Modo Offline
              </div>}

            <Button onClick={handleCreateOrder} disabled={!canCreateOrder || isSubmitting || isSaving} className="w-full transition-all duration-200 hover:scale-105 bg-green-600 hover:bg-green-700" size="lg">
              {(isSubmitting || isSaving) ? <div className="flex items-center space-x-2">
                  <Loader className="h-4 w-4 animate-spin" />
                  <span>{isEditMode ? 'Salvando...' : 'Criando...'}</span>
                </div> : <div className="flex items-center space-x-2">
                  <ShoppingCart size={16} />
                  <span>{isEditMode ? 'Salvar Pedido' : 'Criar Pedido'}</span>
                </div>}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>;
}