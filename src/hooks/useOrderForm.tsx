
import { useState } from 'react';
import { Customer, SalesRep, OrderItem, Order } from '@/types';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

export function useOrderForm() {
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [selectedSalesRep, setSelectedSalesRep] = useState<SalesRep | null>(null);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [selectedPaymentTable, setSelectedPaymentTable] = useState('default-table');
  const [customerInputValue, setCustomerInputValue] = useState('');
  const [salesRepInputValue, setSalesRepInputValue] = useState('');
  const [isEditMode, setIsEditMode] = useState(false);
  const [currentOrderId, setCurrentOrderId] = useState<string | null>(null);
  const [originalOrder, setOriginalOrder] = useState<Order | null>(null);
  const [isProcessingItem, setIsProcessingItem] = useState(false);

  const resetForm = () => {
    console.log("🔄 Resetting form completely");
    setSelectedCustomer(null);
    setSelectedSalesRep(null);
    setOrderItems([]);
    setSelectedPaymentTable('default-table');
    setIsEditMode(false);
    setCurrentOrderId(null);
    setCustomerInputValue('');
    setSalesRepInputValue('');
    setOriginalOrder(null);
    setIsProcessingItem(false);
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + ((item.unitPrice || 0) * (item.quantity || 0)), 0);
  };

  const handleAddItem = (product: any, quantity: number, price: number) => {
    console.log("🛒 === STARTING ADD ITEM PROCESS ===");
    console.log("📦 Product:", product);
    console.log("🔢 Quantity:", quantity);
    console.log("💰 Price:", price);
    console.log("🎯 Edit Mode:", isEditMode);
    console.log("🔄 Currently processing:", isProcessingItem);
    
    // Prevent multiple simultaneous operations
    if (isProcessingItem) {
      console.log("⚠️ Already processing an item operation, skipping");
      return;
    }

    if (!product || !product.id) {
      console.error("❌ Invalid product provided:", product);
      toast({
        title: "Erro",
        description: "Produto inválido selecionado",
        variant: "destructive"
      });
      return;
    }

    if (!quantity || quantity <= 0) {
      console.error("❌ Invalid quantity provided:", quantity);
      toast({
        title: "Erro", 
        description: "Quantidade deve ser maior que zero",
        variant: "destructive"
      });
      return;
    }

    if (price < 0) {
      console.error("❌ Invalid price provided:", price);
      toast({
        title: "Erro",
        description: "Preço deve ser maior ou igual a zero",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsProcessingItem(true);
      
      setOrderItems(currentItems => {
        console.log("📋 Current items before adding:", currentItems.length);
        console.log("📋 Current items details:", currentItems.map(item => ({ id: item.id, productId: item.productId, name: item.productName, qty: item.quantity })));
        
        const existingItemIndex = currentItems.findIndex(item => item.productId === product.id);
        
        if (existingItemIndex !== -1) {
          console.log("🔄 Updating existing item at index:", existingItemIndex);
          const existingItem = currentItems[existingItemIndex];
          const newQuantity = (existingItem.quantity || 0) + quantity;
          const newTotal = price * newQuantity;
          
          const updatedItems = [...currentItems];
          updatedItems[existingItemIndex] = {
            ...existingItem,
            quantity: newQuantity,
            unitPrice: price,
            price: price,
            total: newTotal
          };
          
          console.log("✅ Updated existing item. New quantity:", newQuantity);
          console.log("📋 Updated items list:", updatedItems.length);
          
          toast({
            title: "Item atualizado",
            description: `${quantity}x ${product.name} adicionado ao item existente (total: ${newQuantity})`
          });
          
          return updatedItems;
        } else {
          const newItemId = uuidv4();
          const newItem: OrderItem = {
            id: newItemId,
            productId: product.id,
            productName: product.name,
            productCode: product.code || 0,
            quantity: quantity,
            price: price,
            unitPrice: price,
            discount: 0,
            total: price * quantity
          };
          
          console.log("➕ Adding new item with ID:", newItemId);
          console.log("➕ New item details:", newItem);
          const updatedItems = [...currentItems, newItem];
          console.log("✅ Added new item. Total items:", updatedItems.length);
          
          toast({
            title: "Item adicionado",
            description: `${quantity}x ${product.name} adicionado ao pedido`
          });
          
          return updatedItems;
        }
      });
    } catch (error) {
      console.error("❌ Error in handleAddItem:", error);
      toast({
        title: "Erro ao adicionar item",
        description: "Ocorreu um erro ao adicionar o item ao pedido",
        variant: "destructive"
      });
    } finally {
      // Reset processing flag after a short delay
      setTimeout(() => {
        setIsProcessingItem(false);
        console.log("🔄 Processing flag reset");
      }, 500);
    }
  };

  const handleRemoveItem = (productId: string) => {
    console.log("🗑️ === STARTING REMOVE ITEM PROCESS ===");
    console.log("🎯 Product ID to remove:", productId);
    console.log("🎯 Edit Mode:", isEditMode);
    console.log("🔄 Currently processing:", isProcessingItem);
    
    // Prevent multiple simultaneous operations
    if (isProcessingItem) {
      console.log("⚠️ Already processing an item operation, skipping");
      return;
    }
    
    if (!productId || productId.trim() === '') {
      console.error("❌ Invalid product ID provided:", productId);
      toast({
        title: "Erro",
        description: "ID do produto inválido para remoção",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsProcessingItem(true);
      
      setOrderItems(currentItems => {
        console.log("📋 Current items before removal:", currentItems.length);
        console.log("📋 Items to check:", currentItems.map(item => ({ id: item.id, productId: item.productId, name: item.productName })));
        
        const itemToRemove = currentItems.find(item => item.productId === productId);
        if (!itemToRemove) {
          console.warn("⚠️ Item not found for removal. ProductId:", productId);
          console.warn("⚠️ Available productIds:", currentItems.map(item => item.productId));
          toast({
            title: "Erro",
            description: "Item não encontrado para remoção",
            variant: "destructive"
          });
          return currentItems;
        }
        
        const updatedItems = currentItems.filter(item => item.productId !== productId);
        console.log("✅ Item removed successfully. Remaining items:", updatedItems.length);
        console.log("✅ Removed item:", itemToRemove.productName);
        
        toast({
          title: "Item removido",
          description: `${itemToRemove.productName} removido do pedido`
        });
        
        return updatedItems;
      });
    } catch (error) {
      console.error("❌ Error in handleRemoveItem:", error);
      toast({
        title: "Erro ao remover item",
        description: "Ocorreu um erro ao remover o item do pedido",
        variant: "destructive"
      });
    } finally {
      // Reset processing flag after a short delay
      setTimeout(() => {
        setIsProcessingItem(false);
        console.log("🔄 Processing flag reset");
      }, 500);
    }
  };

  return {
    selectedCustomer,
    setSelectedCustomer,
    selectedSalesRep,
    setSelectedSalesRep,
    orderItems,
    setOrderItems,
    selectedPaymentTable,
    setSelectedPaymentTable,
    customerInputValue,
    setCustomerInputValue,
    salesRepInputValue,
    setSalesRepInputValue,
    isEditMode,
    setIsEditMode,
    currentOrderId,
    setCurrentOrderId,
    originalOrder,
    setOriginalOrder,
    isProcessingItem,
    resetForm,
    calculateTotal,
    handleAddItem,
    handleRemoveItem
  };
}
