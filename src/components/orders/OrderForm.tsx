
import React, { useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Customer, SalesRep, PaymentTable, Product, OrderItem } from '@/types';
import { ConnectionStatus as ConnectionStatusType } from '@/context/AppContextTypes';
import CustomerSearchInput from './CustomerSearchInput';
import SalesRepSearchInput from './SalesRepSearchInput';
import PaymentOptionsInput from './PaymentOptionsInput';
import ProductSearchInput from './ProductSearchInput';
import OrderItemsTable from './OrderItemsTable';
import { Button } from "@/components/ui/button";
import { Save, FileText, ClipboardList } from "lucide-react";
import ConnectionStatus from '@/components/ui/ConnectionStatus';

interface OrderFormProps {
  customers: Customer[];
  salesReps: SalesRep[];
  paymentTables: PaymentTable[];
  products: Product[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  selectedSalesRep: SalesRep | null;
  setSelectedSalesRep: (salesRep: SalesRep | null) => void;
  orderItems: OrderItem[];
  setOrderItems: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  selectedPaymentTable: string;
  setSelectedPaymentTable: (id: string) => void;
  isSubmitting: boolean;
  handleCreateOrder: () => Promise<void>;
  isEditMode: boolean;
  handleViewRecentPurchases: () => void;
  customerInputValue: string;
  salesRepInputValue?: string;
  handleAddItem: (product: Product, quantity: number, price: number) => void;
  handleRemoveItem: (productId: string) => void;
  connectionStatus?: ConnectionStatusType;
}

export default function OrderForm({
  customers,
  salesReps,
  paymentTables,
  products,
  selectedCustomer,
  setSelectedCustomer,
  selectedSalesRep,
  setSelectedSalesRep,
  orderItems,
  setOrderItems,
  selectedPaymentTable,
  setSelectedPaymentTable,
  isSubmitting,
  handleCreateOrder,
  isEditMode,
  handleViewRecentPurchases,
  customerInputValue,
  salesRepInputValue = '',
  handleAddItem,
  handleRemoveItem,
  connectionStatus = 'online'
}: OrderFormProps) {
  const salesRepInputRef = useRef<HTMLInputElement>(null);
  const customerInputRef = useRef<HTMLInputElement>(null);
  const paymentTableRef = useRef<HTMLButtonElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);
  
  console.log("🔄 OrderForm rendered - isEditMode:", isEditMode);
  
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.unitPrice || 0) * (item.quantity || 0), 0);
  };

  // Helper function to get color class based on connection status
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

  // Get selected payment table name for display
  const getPaymentTableName = () => {
    const table = paymentTables.find(pt => pt.id === selectedPaymentTable);
    return table?.name || 'Não selecionado';
  };

  return (
    <div className="space-y-6">
      <Card className="shadow-md border-gray-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                {isEditMode ? 'Editar Pedido' : 'Novo Pedido'}
              </h3>
              {isEditMode && (
                <div className="text-sm text-blue-600 bg-blue-50 px-3 py-1 rounded-full">
                  Modo de Edição - Você pode adicionar e remover itens
                </div>
              )}
            </div>
            
            {/* Seção de seleção de vendedor, cliente e forma de pagamento - apenas para novos pedidos */}
            {!isEditMode && (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Vendedor</label>
                  <SalesRepSearchInput
                    salesReps={salesReps}
                    selectedSalesRep={selectedSalesRep}
                    setSelectedSalesRep={setSelectedSalesRep}
                    inputRef={salesRepInputRef}
                    onKeyDown={(e) => e.key === 'Enter' && customerInputRef.current?.focus()}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Cliente</label>
                  <CustomerSearchInput
                    customers={customers}
                    selectedCustomer={selectedCustomer}
                    setSelectedCustomer={setSelectedCustomer}
                    inputRef={customerInputRef}
                    onKeyDown={(e) => e.key === 'Enter' && paymentTableRef.current?.focus()}
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Forma de Pagamento</label>
                  <PaymentOptionsInput
                    paymentTables={paymentTables}
                    selectedPaymentTable={selectedPaymentTable}
                    setSelectedPaymentTable={setSelectedPaymentTable}
                    buttonRef={paymentTableRef}
                    onKeyDown={(e) => e.key === 'Enter' && productInputRef.current?.focus()}
                  />
                </div>
              </div>
            )}
            
            {/* Informações do pedido em modo de edição */}
            {isEditMode && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-gray-50 p-4 rounded-lg">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Vendedor</label>
                  <div className="text-gray-900 font-medium">{salesRepInputValue || 'Não selecionado'}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Cliente</label>
                  <div className="text-gray-900 font-medium">{customerInputValue || 'Não selecionado'}</div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                  <div className="text-gray-900 font-medium">{getPaymentTableName()}</div>
                </div>
              </div>
            )}
            
            {/* Botão de compras recentes e salvar */}
            <div className="flex justify-between items-center gap-4">
              <div className="flex-1">
                <Button 
                  onClick={handleViewRecentPurchases} 
                  variant="outline" 
                  className="w-full border-dashed border-gray-300 hover:border-gray-400 text-gray-700" 
                  disabled={!selectedCustomer}
                >
                  <ClipboardList size={18} className="mr-2" />
                  Visualizar Compras Recentes
                </Button>
              </div>
              
              <Button 
                onClick={handleCreateOrder} 
                disabled={isSubmitting || !selectedCustomer || !selectedSalesRep || orderItems.length === 0} 
                className={`w-48 h-11 text-white ${getConnectionStatusColor()}`}
              >
                <Save size={18} className="mr-2" />
                {isSubmitting ? 'Salvando...' : isEditMode ? 'Atualizar Pedido' : 'Finalizar Pedido'}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Busca de produtos */}
      <Card className="shadow-md border-gray-200">
        <CardContent className="pt-6">
          <div className="mb-4">
            <h4 className="text-md font-medium text-gray-800 mb-2">
              {isEditMode ? 'Adicionar Novos Itens ao Pedido' : 'Adicionar Itens ao Pedido'}
            </h4>
          </div>
          <ProductSearchInput 
            products={products} 
            addItemToOrder={handleAddItem} 
            inlineLayout={true} 
            inputRef={productInputRef} 
          />
        </CardContent>
      </Card>
      
      {/* Tabela de itens */}
      <Card className="shadow-md border-gray-200">
        <CardContent className="p-0">
          <div className="p-4 border-b bg-gray-50">
            <h4 className="text-md font-medium text-gray-800">
              Itens do Pedido
              {isEditMode && (
                <span className="ml-2 text-sm text-blue-600">(Clique no ícone da lixeira para remover itens)</span>
              )}
            </h4>
          </div>
          <OrderItemsTable 
            orderItems={orderItems} 
            onRemoveItem={handleRemoveItem} 
            calculateTotal={calculateTotal} 
            isEditMode={isEditMode}
          />
        </CardContent>
      </Card>
    </div>
  );
}
