
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

  const handleSalesRepNext = () => {
    if (customerInputRef.current) {
      customerInputRef.current.focus();
    }
  };

  const handleCustomerNext = () => {
    if (paymentTableRef.current) {
      paymentTableRef.current.focus();
    }
  };

  const handlePaymentNext = () => {
    if (productInputRef.current) {
      productInputRef.current.focus();
    }
  };

  return (
    <div className="space-y-4">
      <Card className="shadow-sm border-gray-200">
        <CardContent className="pt-4 pb-4">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-medium">
                {isEditMode ? 'Editar Pedido' : 'Novo Pedido'}
              </h3>
              {isEditMode && (
                <div className="text-xs text-blue-600 bg-blue-50 px-2 py-1 rounded">
                  Modo de Edição
                </div>
              )}
            </div>
            
            {/* Campos de seleção para novo pedido ou informações readonly para edição */}
            {!isEditMode ? (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
                {/* Seleção de vendedor */}
                <SalesRepSearchInput
                  salesReps={salesReps}
                  selectedSalesRep={selectedSalesRep}
                  setSelectedSalesRep={setSelectedSalesRep}
                  inputRef={salesRepInputRef}
                  onEnterPress={handleSalesRepNext}
                  initialInputValue={salesRepInputValue}
                  compact={true}
                />

                {/* Seleção de cliente */}
                <CustomerSearchInput
                  customers={customers}
                  selectedCustomer={selectedCustomer}
                  setSelectedCustomer={setSelectedCustomer}
                  inputRef={customerInputRef}
                  onEnterPress={handleCustomerNext}
                  initialInputValue={customerInputValue}
                  compact={true}
                />

                {/* Seleção de forma de pagamento */}
                <div className="space-y-1">
                  <PaymentOptionsInput
                    paymentTables={paymentTables}
                    selectedPaymentTable={selectedPaymentTable}
                    setSelectedPaymentTable={setSelectedPaymentTable}
                    buttonRef={paymentTableRef}
                    onSelectComplete={handlePaymentNext}
                    simplifiedView={true}
                  />
                </div>
              </div>
            ) : (
              /* Informações readonly para edição */
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 bg-gray-50 p-3 rounded">
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Vendedor</label>
                  <div className="text-sm text-gray-900 font-medium">{salesRepInputValue || 'Não selecionado'}</div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Cliente</label>
                  <div className="text-sm text-gray-900 font-medium">{customerInputValue || 'Não selecionado'}</div>
                </div>
                
                <div>
                  <label className="block text-xs font-medium text-gray-700 mb-1">Forma de Pagamento</label>
                  <div className="text-sm text-gray-900 font-medium">{getPaymentTableName()}</div>
                </div>
              </div>
            )}
            
            {/* Botão de compras recentes e salvar */}
            <div className="flex flex-col sm:flex-row justify-between items-stretch sm:items-center gap-3">
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
          </div>
        </CardContent>
      </Card>
      
      {/* Busca de produtos - sempre editável */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="py-3">
          <div className="mb-3">
            <h4 className="text-sm font-medium text-gray-800">
              {isEditMode ? 'Adicionar Itens' : 'Adicionar Itens ao Pedido'}
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
      
      {/* Tabela de itens - sempre editável */}
      <Card className="shadow-sm border-gray-200">
        <CardContent className="p-0">
          <div className="px-4 py-3 border-b bg-gray-50">
            <h4 className="text-sm font-medium text-gray-800">
              Itens do Pedido
              {isEditMode && (
                <span className="ml-2 text-xs text-blue-600">(Clique na lixeira para remover)</span>
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
