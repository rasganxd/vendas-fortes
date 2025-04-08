
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { useOrders } from '@/hooks/useOrders';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Save, ShoppingCart } from "lucide-react";
import { useNavigate } from 'react-router-dom';

export default function NewOrder() {
  const { customers, salesReps, products } = useAppContext();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSalesRep, setSelectedSalesRep] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (products.length > 0 && !selectedProduct) {
      setSelectedProduct(products[0]);
    }
  }, [products, selectedProduct]);

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast({
        title: "Erro",
        description: "Selecione um produto antes de adicionar ao pedido.",
        variant: "destructive"
      });
      return;
    }

    if (quantity <= 0) {
      toast({
        title: "Erro",
        description: "A quantidade deve ser maior que zero.",
        variant: "destructive"
      });
      return;
    }

    const existingItem = orderItems.find(item => item.productId === selectedProduct.id);
    
    if (existingItem) {
      const updatedItems = orderItems.map(item =>
        item.productId === selectedProduct.id ? { ...item, quantity: item.quantity + quantity } : item
      );
      setOrderItems(updatedItems);
    } else {
      setOrderItems([...orderItems, {
        productId: selectedProduct.id,
        productName: selectedProduct.name,
        quantity: quantity,
        price: selectedProduct.price,
        unitPrice: selectedProduct.price,
        total: selectedProduct.price * quantity
      }]);
    }
    
    setQuantity(1);
    toast({
      title: "Item adicionado",
      description: `${quantity}x ${selectedProduct.name} adicionado ao pedido`
    });
  };

  const handleRemoveItem = (productId) => {
    const updatedItems = orderItems.filter(item => item.productId !== productId);
    setOrderItems(updatedItems);
    toast({
      title: "Item removido",
      description: "Item removido do pedido"
    });
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const resetForm = () => {
    setSelectedCustomer(null);
    setSelectedSalesRep(null);
    setOrderItems([]);
    setOrderNotes('');
    setQuantity(1);
  };

  const handleCreateOrder = async () => {
    if (!selectedCustomer) {
      toast({
        title: "Erro",
        description: "Selecione um cliente para o pedido.",
        variant: "destructive"
      });
      return;
    }
    
    if (!selectedSalesRep) {
      toast({
        title: "Erro",
        description: "Selecione um vendedor para o pedido.",
        variant: "destructive"
      });
      return;
    }
    
    if (orderItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item ao pedido.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      setIsSubmitting(true);
      
      // Prepare order data
      const orderData = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        salesRepId: selectedSalesRep.id,
        salesRepName: selectedSalesRep.name,
        items: orderItems,
        total: calculateTotal(),
        status: "draft",
        paymentStatus: "pending",
        notes: orderNotes,
        createdAt: new Date(),
        // Add delivery address info from customer
        deliveryAddress: selectedCustomer.address,
        deliveryCity: selectedCustomer.city,
        deliveryState: selectedCustomer.state,
        deliveryZipCode: selectedCustomer.zipCode
      };
      
      // Create the order
      const orderId = await addOrder(orderData);
      
      if (orderId) {
        toast({
          title: "Pedido Criado",
          description: `Pedido #${orderId.substring(0, 6)} criado com sucesso.`
        });
        
        // Reset the form after successful order creation
        resetForm();
        
        // Optional: Navigate to the orders list after a short delay
        setTimeout(() => {
          navigate('/pedidos');
        }, 1500);
      }
    } catch (error) {
      console.error("Erro ao criar pedido:", error);
      toast({
        title: "Erro ao criar pedido",
        description: "Ocorreu um erro ao criar o pedido. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <PageLayout title="Novo Pedido">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Customer and Sales Rep Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart size={20} /> Informações do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="customer">Cliente</Label>
              <Select 
                onValueChange={(value) => setSelectedCustomer(customers.find(c => c.id === value) || null)}
                value={selectedCustomer?.id || ''}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um cliente" />
                </SelectTrigger>
                <SelectContent>
                  {customers.map((customer) => (
                    <SelectItem key={customer.id} value={customer.id}>
                      {customer.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salesRep">Vendedor</Label>
              <Select 
                onValueChange={(value) => setSelectedSalesRep(salesReps.find(s => s.id === value) || null)}
                value={selectedSalesRep?.id || ''}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um vendedor" />
                </SelectTrigger>
                <SelectContent>
                  {salesReps.map((salesRep) => (
                    <SelectItem key={salesRep.id} value={salesRep.id}>
                      {salesRep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="notes">Observações</Label>
              <Textarea
                id="notes"
                value={orderNotes}
                onChange={(e) => setOrderNotes(e.target.value)}
                placeholder="Adicione observações sobre o pedido"
                className="min-h-[100px]"
              />
            </div>
          </CardContent>
        </Card>

        {/* Middle Column - Product Selection */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Adicionar Produtos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product">Produto</Label>
              <Select 
                onValueChange={(value) => setSelectedProduct(products.find(p => p.id === value) || null)}
                value={selectedProduct?.id || ''}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      {product.name} - {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  id="quantity"
                  value={quantity}
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                  min="1"
                  className="w-full"
                />
                <Button onClick={handleAddItem} className="shrink-0">
                  <Plus size={16} className="mr-2" /> Adicionar
                </Button>
              </div>
            </div>
            
            {selectedProduct && (
              <div className="p-3 bg-gray-50 rounded-md mt-4">
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-gray-500">{selectedProduct.description}</p>
                <p className="font-semibold mt-1">
                  {selectedProduct.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </p>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Right Column - Order Summary */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Resumo do Pedido</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="mb-4">
              <div className="flex justify-between items-center text-xl font-bold">
                <span>Total:</span>
                <span>{calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}</span>
              </div>
              <div className="flex justify-between items-center text-sm text-gray-500 mt-1">
                <span>Itens:</span>
                <span>{orderItems.length}</span>
              </div>
            </div>
            
            <Button 
              onClick={handleCreateOrder} 
              disabled={isSubmitting || !selectedCustomer || !selectedSalesRep || orderItems.length === 0} 
              className="w-full bg-sales-800 hover:bg-sales-700 mb-4"
            >
              <Save size={16} className="mr-2" />
              {isSubmitting ? 'Salvando...' : 'Finalizar Pedido'}
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Order Items List */}
      <Card className="mt-6">
        <CardHeader>
          <CardTitle>Itens do Pedido</CardTitle>
        </CardHeader>
        <CardContent>
          {orderItems.length === 0 ? (
            <div className="text-center py-6 text-gray-500">
              Nenhum item adicionado ao pedido.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full border-collapse">
                <thead>
                  <tr className="bg-gray-50">
                    <th className="px-4 py-2 text-left">Produto</th>
                    <th className="px-4 py-2 text-center">Quantidade</th>
                    <th className="px-4 py-2 text-right">Preço Unit.</th>
                    <th className="px-4 py-2 text-right">Total</th>
                    <th className="px-4 py-2 text-center">Ações</th>
                  </tr>
                </thead>
                <tbody>
                  {orderItems.map((item) => (
                    <tr key={item.productId} className="border-t">
                      <td className="px-4 py-3">{item.productName}</td>
                      <td className="px-4 py-3 text-center">{item.quantity}</td>
                      <td className="px-4 py-3 text-right">
                        {item.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-4 py-3 text-right font-medium">
                        {(item.price * item.quantity).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <Button variant="ghost" size="sm" onClick={() => handleRemoveItem(item.productId)}>
                          <Trash2 size={16} className="text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t">
                    <td colSpan={3} className="px-4 py-3 text-right font-semibold">Total:</td>
                    <td className="px-4 py-3 text-right font-bold">
                      {calculateTotal().toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </td>
                    <td></td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </PageLayout>
  );
}
