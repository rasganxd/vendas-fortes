
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';
import { orderItemService } from '@/services/supabase/orderItemService';
import { OrderItem } from '@/types';

export const useOrderFormItemOperations = (
  orderItems: OrderItem[],
  setOrderItems: React.Dispatch<React.SetStateAction<OrderItem[]>>,
  isEditMode: boolean,
  currentOrderId: string | null,
  isProcessingItem: boolean,
  setIsProcessingItem: React.Dispatch<React.SetStateAction<boolean>>,
  lastOperation: string,
  setLastOperation: React.Dispatch<React.SetStateAction<string>>
) => {
  const handleAddItem = async (product: any, quantity: number, price: number, unit?: string) => {
    const operationId = `add-${Date.now()}`;
    console.log("🛒 === STARTING ADD ITEM PROCESS ===", operationId);
    console.log("🛒 Product:", product.name, "Unit:", unit, "Quantity:", quantity, "Price:", price);
    
    if (isProcessingItem || lastOperation === operationId) {
      console.log("⚠️ Operation blocked - already processing or duplicate");
      return;
    }

    if (!product?.id || quantity <= 0 || price < 0) {
      toast({
        title: "Erro",
        description: "Dados inválidos fornecidos",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsProcessingItem(true);
      setLastOperation(operationId);
      
      setOrderItems(currentItems => {
        // Find existing item with same product AND unit
        const existingItemIndex = currentItems.findIndex(item => 
          item.productId === product.id && item.unit === unit
        );
        
        if (existingItemIndex !== -1) {
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
          
          if (isEditMode && currentOrderId && existingItem.id) {
            orderItemService.updateItemInOrder(currentOrderId, existingItem.id, {
              quantity: newQuantity,
              unitPrice: price,
              price: price,
              total: newTotal
            }).then(() => {
              orderItemService.updateOrderTotal(currentOrderId);
              console.log("✅ Existing item updated in database");
            }).catch(error => {
              console.error("❌ Error updating item in database:", error);
            });
          }
          
          toast({
            title: "Item atualizado",
            description: `${quantity}x ${product.name} (${unit}) adicionado ao item existente (total: ${newQuantity})`
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
            total: price * quantity,
            unit: unit || product.unit || 'UN' // Store the unit used
          };
          
          const updatedItems = [...currentItems, newItem];
          
          if (isEditMode && currentOrderId) {
            orderItemService.addItemToOrder(currentOrderId, newItem).then((savedItem) => {
              setOrderItems(prevItems => 
                prevItems.map(item => 
                  item.id === newItemId ? { ...item, id: savedItem.id } : item
                )
              );
              orderItemService.updateOrderTotal(currentOrderId);
              console.log("✅ New item saved to database with ID:", savedItem.id);
            }).catch(error => {
              console.error("❌ Error saving item to database:", error);
              setOrderItems(prevItems => prevItems.filter(item => item.id !== newItemId));
              toast({
                title: "Erro ao salvar item",
                description: "Não foi possível salvar o item no banco de dados",
                variant: "destructive"
              });
            });
          }
          
          toast({
            title: "Item adicionado",
            description: `${quantity}x ${product.name} (${unit}) adicionado ao pedido`
          });
          
          return updatedItems;
        }
      });

      window.dispatchEvent(new CustomEvent('orderItemsUpdated', { 
        detail: { 
          action: 'add', 
          product: product,
          unit: unit,
          orderId: currentOrderId 
        } 
      }));

    } catch (error) {
      console.error("❌ Error in handleAddItem:", error);
      toast({
        title: "Erro ao adicionar item",
        description: "Ocorreu um erro ao adicionar o item ao pedido",
        variant: "destructive"
      });
    } finally {
      setTimeout(() => {
        setIsProcessingItem(false);
        console.log("🔄 Processing flag reset for operation:", operationId);
      }, 1000);
    }
  };

  const handleRemoveItem = async (productId: string) => {
    const operationId = `remove-${Date.now()}`;
    console.log("🗑️ === STARTING REMOVE ITEM PROCESS ===", operationId);
    
    if (isProcessingItem || lastOperation === operationId) {
      console.log("⚠️ Operation blocked - already processing or duplicate");
      return;
    }
    
    if (!productId?.trim()) {
      toast({
        title: "Erro",
        description: "ID do produto inválido para remoção",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsProcessingItem(true);
      setLastOperation(operationId);
      
      setOrderItems(currentItems => {
        const itemToRemove = currentItems.find(item => item.productId === productId);
        if (!itemToRemove) {
          toast({
            title: "Erro",
            description: "Item não encontrado para remoção",
            variant: "destructive"
          });
          return currentItems;
        }
        
        const updatedItems = currentItems.filter(item => item.productId !== productId);
        
        if (isEditMode && currentOrderId && itemToRemove.productCode) {
          // Convert productId to productCode for removal
          orderItemService.removeItemFromOrder(currentOrderId, itemToRemove.productCode).then(() => {
            orderItemService.updateOrderTotal(currentOrderId);
            console.log("✅ Item removed from database");
          }).catch(error => {
            console.error("❌ Error removing item from database:", error);
            setOrderItems(prevItems => [...prevItems, itemToRemove]);
            toast({
              title: "Erro ao remover item",
              description: "Não foi possível remover o item do banco de dados",
              variant: "destructive"
            });
          });
        }
        
        toast({
          title: "Item removido",
          description: `${itemToRemove.productName} removido do pedido`
        });

        window.dispatchEvent(new CustomEvent('orderItemsUpdated', { 
          detail: { 
            action: 'remove', 
            productId: productId,
            orderId: currentOrderId 
          } 
        }));
        
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
      setTimeout(() => {
        setIsProcessingItem(false);
        console.log("🔄 Processing flag reset for operation:", operationId);
      }, 1000);
    }
  };

  return {
    handleAddItem,
    handleRemoveItem
  };
};
