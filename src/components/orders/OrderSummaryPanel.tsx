import React from 'react';
import { OrderItem, Customer, SalesRep } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { ShoppingCart, User, UserCheck, CreditCard, Package, Calculator } from 'lucide-react';
interface OrderSummaryPanelProps {
  orderItems: OrderItem[];
  selectedCustomer: Customer | null;
  selectedSalesRep: SalesRep | null;
  selectedPaymentTable: string;
  calculateTotal: () => number;
  isEditMode: boolean;
}
export default function OrderSummaryPanel({
  orderItems,
  selectedCustomer,
  selectedSalesRep,
  selectedPaymentTable,
  calculateTotal,
  isEditMode
}: OrderSummaryPanelProps) {
  const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);
  const totalValue = calculateTotal();
  const averageItemValue = orderItems.length > 0 ? totalValue / orderItems.length : 0;
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
              <span className="font-medium text-gray-800">Valor Total:</span>
              <span className="text-xl font-bold text-green-600">
                {totalValue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
              </span>
            </div>
            
            {orderItems.length > 0 && <div className="flex items-center justify-between text-xs text-gray-500">
                <span>Valor médio por item:</span>
                <span>
                  {averageItemValue.toLocaleString('pt-BR', {
                style: 'currency',
                currency: 'BRL'
              })}
                </span>
              </div>}
          </div>
        </CardContent>
      </Card>

      {/* Customer Info */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <User size={20} />
            Informações
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Cliente</label>
            {selectedCustomer ? <div className="mt-1">
                <div className="font-medium text-gray-900">{selectedCustomer.name}</div>
                <div className="text-sm text-gray-500">Cód: {selectedCustomer.code}</div>
                {selectedCustomer.phone && <div className="text-sm text-gray-500">{selectedCustomer.phone}</div>}
              </div> : <div className="mt-1 text-sm text-gray-400 italic">Nenhum cliente selecionado</div>}
          </div>

          <Separator />

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Vendedor</label>
            {selectedSalesRep ? <div className="mt-1">
                <div className="font-medium text-gray-900 flex items-center gap-2">
                  <UserCheck size={16} />
                  {selectedSalesRep.name}
                </div>
                <div className="text-sm text-gray-500">Cód: {selectedSalesRep.code}</div>
              </div> : <div className="mt-1 text-sm text-gray-400 italic">Nenhum vendedor selecionado</div>}
          </div>

          <Separator />

          <div>
            <label className="text-xs font-medium text-gray-500 uppercase tracking-wide">Forma de Pagamento</label>
            <div className="mt-1 flex items-center gap-2">
              <CreditCard size={16} />
              <span className="text-sm font-medium">
                {selectedPaymentTable === 'default-table' ? 'Padrão' : selectedPaymentTable}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Order Validation */}
      <Card className="shadow-sm border-gray-200">
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Status de Validação</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm">Vendedor:</span>
            <Badge variant={selectedSalesRep ? "default" : "destructive"}>
              {selectedSalesRep ? "✓" : "✗"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Cliente:</span>
            <Badge variant={selectedCustomer ? "default" : "destructive"}>
              {selectedCustomer ? "✓" : "✗"}
            </Badge>
          </div>
          
          <div className="flex items-center justify-between">
            <span className="text-sm">Itens:</span>
            <Badge variant={orderItems.length > 0 ? "default" : "destructive"}>
              {orderItems.length > 0 ? "✓" : "✗"}
            </Badge>
          </div>
          
          <Separator />
          
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Pronto para finalizar:</span>
            <Badge variant={selectedSalesRep && selectedCustomer && orderItems.length > 0 ? "default" : "secondary"}>
              {selectedSalesRep && selectedCustomer && orderItems.length > 0 ? "SIM" : "NÃO"}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Keyboard shortcuts help */}
      <Card className="shadow-sm border-gray-200">
        
        
      </Card>
    </div>;
}