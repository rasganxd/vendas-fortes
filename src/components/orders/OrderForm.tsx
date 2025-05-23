
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

  return <div className="space-y-6">
      <Card className="shadow-md border-gray-200">
        <CardContent className="pt-6">
          <div className="grid grid-cols-1 gap-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-medium">
                {isEditMode ? 'Editar Pedido' : 'Novo Pedido'}
              </h3>
              {/* Remove the ConnectionStatus component here since it's already in the page header */}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div className="relative">
                <SalesRepSearchInput salesReps={salesReps} selectedSalesRep={selectedSalesRep} setSelectedSalesRep={setSelectedSalesRep} inputRef={salesRepInputRef} onEnterPress={() => customerInputRef.current?.focus()} initialInputValue={salesRepInputValue} />
              </div>
              
              <div className="relative">
                <CustomerSearchInput customers={customers} selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer} inputRef={customerInputRef} onEnterPress={() => paymentTableRef.current?.focus()} initialInputValue={customerInputValue} />
              </div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-5">
              <div className="relative">
                <PaymentOptionsInput paymentTables={paymentTables} selectedPaymentTable={selectedPaymentTable} setSelectedPaymentTable={setSelectedPaymentTable} simplifiedView={true} buttonRef={paymentTableRef} onSelectComplete={() => productInputRef.current?.focus()} customerId={selectedCustomer?.id} customerName={selectedCustomer?.name} orderTotal={calculateTotal()} />
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <div className="flex-1">
                  <Button onClick={handleViewRecentPurchases} variant="outline" className="w-full border-dashed border-gray-300 hover:border-gray-400 text-gray-700" disabled={!selectedCustomer}>
                    <ClipboardList size={18} className="mr-2" />
                    Visualizar Compras Recentes
                  </Button>
                </div>
                
                <Button onClick={handleCreateOrder} disabled={isSubmitting || !selectedCustomer || !selectedSalesRep || orderItems.length === 0} className={`w-48 h-11 text-white ${getConnectionStatusColor()}`}>
                  <Save size={18} className="mr-2" />
                  {isSubmitting ? 'Salvando...' : isEditMode ? 'Atualizar Pedido' : 'Finalizar Pedido'}
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card className="shadow-md border-gray-200">
        <CardContent className="pt-6">
          <ProductSearchInput products={products} addItemToOrder={handleAddItem} inlineLayout={true} inputRef={productInputRef} />
        </CardContent>
      </Card>
      
      <Card className="shadow-md border-gray-200">
        <CardContent className="p-0">
          <OrderItemsTable orderItems={orderItems} onRemoveItem={handleRemoveItem} calculateTotal={calculateTotal} isEditMode={isEditMode} />
        </CardContent>
      </Card>
    </div>;
}
