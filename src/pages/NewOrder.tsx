import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/context/AppContext';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "@/hooks/use-toast";

export default function NewOrder() {
  const { customers, salesReps, products, addOrder } = useAppContext();
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSalesRep, setSelectedSalesRep] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [orderNotes, setOrderNotes] = useState('');

  useEffect(() => {
    if (products.length > 0) {
      setSelectedProduct(products[0]);
    }
  }, [products]);

  const handleAddItem = () => {
    if (!selectedProduct) return;

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
        price: selectedProduct.price
      }]);
    }
    setQuantity(1);
  };

  const handleRemoveItem = (productId) => {
    const updatedItems = orderItems.filter(item => item.productId !== productId);
    setOrderItems(updatedItems);
  };

  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  };

  const handleCreateOrder = () => {
    if (!selectedCustomer || !selectedSalesRep) return;
    
    addOrder({
      customerId: selectedCustomer.id,
      customerName: selectedCustomer.name,
      salesRepId: selectedSalesRep.id,
      salesRepName: selectedSalesRep.name,
      items: orderItems,
      total: calculateTotal(),
      status: "draft",
      paymentStatus: "pending",
      notes: orderNotes,
      createdAt: new Date().toISOString()
    });

    setSelectedCustomer(null);
    setSelectedSalesRep(null);
    setOrderItems([]);
    setOrderNotes('');

    toast({
      title: "Pedido Criado",
      description: "O pedido foi criado com sucesso."
    });
  };

  return (
    <PageLayout title="Novo Pedido">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Customer and Sales Rep Selection */}
        <div>
          <div className="mb-4">
            <Label htmlFor="customer">Cliente</Label>
            <Select onValueChange={(value) => setSelectedCustomer(customers.find(c => c.id === value) || null)}>
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
          <div className="mb-4">
            <Label htmlFor="salesRep">Vendedor</Label>
            <Select onValueChange={(value) => setSelectedSalesRep(salesReps.find(s => s.id === value) || null)}>
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
        </div>

        {/* Order Items */}
        <div>
          <div className="mb-4">
            <Label htmlFor="product">Produto</Label>
            <Select onValueChange={(value) => setSelectedProduct(products.find(p => p.id === value) || null)}>
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Selecione um produto" />
              </SelectTrigger>
              <SelectContent>
                {products.map((product) => (
                  <SelectItem key={product.id} value={product.id}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mb-4">
            <Label htmlFor="quantity">Quantidade</Label>
            <Input
              type="number"
              id="quantity"
              value={quantity}
              onChange={(e) => setQuantity(parseInt(e.target.value))}
              min="1"
              className="w-full"
            />
          </div>
          <Button onClick={handleAddItem}>Adicionar Item</Button>
        </div>
      </div>

      {/* Order Items List */}
      <div className="mt-8">
        <h2 className="text-xl font-semibold mb-4">Itens do Pedido</h2>
        {orderItems.length === 0 ? (
          <p>Nenhum item adicionado.</p>
        ) : (
          <ul className="space-y-2">
            {orderItems.map((item) => (
              <li key={item.productId} className="flex items-center justify-between bg-white rounded-lg shadow-sm p-4">
                <span>{item.productName} - Quantidade: {item.quantity} - Preço: R$ {item.price.toFixed(2)}</span>
                <Button variant="destructive" size="sm" onClick={() => handleRemoveItem(item.productId)}>Remover</Button>
              </li>
            ))}
          </ul>
        )}
        <div className="mt-4 text-xl font-bold">
          Total: R$ {calculateTotal().toFixed(2)}
        </div>
      </div>

      {/* Order Notes */}
      <div className="mt-8">
        <Label htmlFor="notes">Observações</Label>
        <Textarea
          id="notes"
          value={orderNotes}
          onChange={(e) => setOrderNotes(e.target.value)}
          placeholder="Adicione observações sobre o pedido"
          className="w-full"
        />
      </div>

      {/* Create Order Button */}
      <div className="mt-8">
        <Button size="lg" onClick={handleCreateOrder} disabled={!selectedCustomer || !selectedSalesRep || orderItems.length === 0}>
          Criar Pedido
        </Button>
      </div>
    </PageLayout>
  );
}
