
import React, { useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Customer, SalesRep, PaymentTable, Product, OrderItem } from '@/types';
import CustomerSearchInput from './CustomerSearchInput';
import SalesRepSearchInput from './SalesRepSearchInput';
import PaymentOptionsInput from './PaymentOptionsInput';
import ProductSearchInput from './ProductSearchInput';
import OrderItemsTable from './OrderItemsTable';
import { Button } from "@/components/ui/button";
import { Save, FileText } from "lucide-react";
import { toast } from "@/components/ui/use-toast";

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
  paymentMethod: string;
  setPaymentMethod: (method: string) => void;
  selectedPaymentTable: string;
  setSelectedPaymentTable: (id: string) => void;
  isSubmitting: boolean;
  handleCreateOrder: () => Promise<void>;
  isEditMode: boolean;
  handleViewRecentPurchases: () => void;
  customerInputValue: string;
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
  paymentMethod,
  setPaymentMethod,
  selectedPaymentTable,
  setSelectedPaymentTable,
  isSubmitting,
  handleCreateOrder,
  isEditMode,
  handleViewRecentPurchases,
  customerInputValue
}: OrderFormProps) {
  const salesRepInputRef = useRef<HTMLInputElement>(null);
  const customerInputRef = useRef<HTMLInputElement>(null);
  const paymentTableRef = useRef<HTMLButtonElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);
  
  const handleAddItem = (product: Product, quantity: number, price: number) => {
    console.log("Adding item to order:", product, quantity, price);
    
    const existingItem = orderItems.find(item => item.productId === product.id);
    
    if (existingItem) {
      const updatedItems = orderItems.map(item =>
        item.productId === product.id ? 
          { 
            ...item, 
            quantity: (item.quantity || 0) + quantity,
            total: (item.unitPrice || price) * ((item.quantity || 0) + quantity)
          } : item
      );
      setOrderItems(updatedItems);
    } else {
      setOrderItems([...orderItems, {
        productId: product.id,
        productName: product.name,
        productCode: product.code,
        quantity: quantity,
        unitPrice: price,
        total: price * quantity
      }]);
    }
    
    toast({
      title: "Item adicionado",
      description: `${quantity}x ${product.name} adicionado ao pedido`
    });
  };

  const handleRemoveItem = (productId: string) => {
    const updatedItems = orderItems.filter(item => item.productId !== productId);
    setOrderItems(updatedItems);
    toast({
      title: "Item removido",
      description: "Item removido do pedido"
    });
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + ((item.unitPrice || 0) * (item.quantity || 0)), 0);
  };

  return (
    <>
      <div className="bg-white border rounded-md p-6 mb-4">
        <div className="grid grid-cols-12 gap-x-4 gap-y-6">
          <div className="col-span-8 grid grid-cols-1 gap-y-4">
            <div>
              <SalesRepSearchInput
                salesReps={salesReps}
                selectedSalesRep={selectedSalesRep}
                setSelectedSalesRep={setSelectedSalesRep}
                inputRef={salesRepInputRef}
                onEnterPress={() => customerInputRef.current?.focus()}
                compact={true}
              />
            </div>
            
            <div>
              <CustomerSearchInput 
                customers={customers}
                selectedCustomer={selectedCustomer}
                setSelectedCustomer={setSelectedCustomer}
                onViewRecentPurchases={handleViewRecentPurchases}
                inputRef={customerInputRef}
                onEnterPress={() => paymentTableRef.current?.focus()}
                compact={true}
                initialInputValue={customerInputValue}
              />
            </div>
            
            <div>
              <PaymentOptionsInput
                paymentTables={paymentTables}
                selectedPaymentTable={selectedPaymentTable}
                setSelectedPaymentTable={setSelectedPaymentTable}
                paymentMethod={paymentMethod}
                setPaymentMethod={setPaymentMethod}
                simplifiedView={true}
                buttonRef={paymentTableRef}
                onSelectComplete={() => productInputRef.current?.focus()}
                customerId={selectedCustomer?.id}
                customerName={selectedCustomer?.name}
                orderTotal={calculateTotal()}
              />
            </div>
            
            <div>
              <ProductSearchInput
                products={products}
                addItemToOrder={handleAddItem}
                inlineLayout={true}
                inputRef={productInputRef}
              />
            </div>
          </div>
          
          <div className="col-span-4 grid grid-cols-1 gap-2">
            <Button 
              variant="outline" 
              className="justify-start mb-2"
              onClick={handleViewRecentPurchases}
            >
              <FileText size={16} className="mr-2" /> Últimas Compras
            </Button>
            <Button 
              onClick={handleCreateOrder} 
              disabled={isSubmitting || !selectedCustomer || !selectedSalesRep || orderItems.length === 0} 
              className="w-full bg-sales-800 hover:bg-sales-700 text-white"
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Salvando...' : isEditMode ? 'Atualizar Pedido' : 'Finalizar Pedido'}
            </Button>
          </div>
        </div>
      </div>
      
      <Card>
        <CardContent className="p-0">
          <OrderItemsTable 
            orderItems={orderItems}
            onRemoveItem={handleRemoveItem}
            calculateTotal={calculateTotal}
          />
        </CardContent>
      </Card>
    </>
  );
}
