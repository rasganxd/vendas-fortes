
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { useOrders } from '@/hooks/useOrders';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/components/ui/use-toast";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Trash2, Plus, Save, ShoppingCart, Search, X, CreditCard } from "lucide-react";
import { useNavigate } from 'react-router-dom';
import { Order, PaymentTable } from '@/types';
import { 
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList
} from "@/components/ui/command";
import { Dialog, DialogContent } from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export default function NewOrder() {
  const { customers, salesReps, products } = useAppContext();
  const { addOrder } = useOrders();
  const navigate = useNavigate();
  
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [selectedSalesRep, setSelectedSalesRep] = useState(null);
  const [orderItems, setOrderItems] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [quantity, setQuantity] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [isCustomerSearchOpen, setIsCustomerSearchOpen] = useState(false);
  const [isSalesRepSearchOpen, setIsSalesRepSearchOpen] = useState(false);
  const [isProductSearchOpen, setIsProductSearchOpen] = useState(false);
  
  const [customerSearch, setCustomerSearch] = useState('');
  const [salesRepSearch, setSalesRepSearch] = useState('');
  const [productSearch, setProductSearch] = useState('');
  
  // Manual input fields for codes
  const [customerInput, setCustomerInput] = useState('');
  const [salesRepInput, setSalesRepInput] = useState('');
  const [productInput, setProductInput] = useState('');
  
  // Custom price state
  const [customPrice, setCustomPrice] = useState(null);
  
  // Payment related states
  const [paymentMethod, setPaymentMethod] = useState('');
  const [selectedPaymentTable, setSelectedPaymentTable] = useState('');
  
  // Mock payment tables for now (later to be replaced by context data)
  const [paymentTables] = useState<PaymentTable[]>([
    {
      id: '1',
      name: 'Pagamento à Vista',
      description: 'Pagamento integral no momento da compra',
      active: true,
      createdAt: new Date(),
      terms: [
        { id: '1-1', days: 0, percentage: 100, description: 'À vista' }
      ]
    },
    {
      id: '2',
      name: 'Pagamento 30/60/90',
      description: 'Pagamento parcelado em 3 vezes',
      active: true,
      createdAt: new Date(),
      terms: [
        { id: '2-1', days: 30, percentage: 33.33, description: '1ª parcela' },
        { id: '2-2', days: 60, percentage: 33.33, description: '2ª parcela' },
        { id: '2-3', days: 90, percentage: 33.34, description: '3ª parcela' }
      ]
    }
  ]);
  
  // Show recent purchases dialog
  const [isRecentPurchasesDialogOpen, setIsRecentPurchasesDialogOpen] = useState(false);

  // Find entities by code
  const findCustomerByCode = (code) => {
    const foundCustomer = customers.find(c => c.code && c.code.toString() === code);
    if (foundCustomer) {
      setSelectedCustomer(foundCustomer);
      setCustomerInput(`${foundCustomer.code} - ${foundCustomer.name}`);
      return true;
    }
    return false;
  };

  const findSalesRepByCode = (code) => {
    const foundSalesRep = salesReps.find(r => r.code && r.code.toString() === code);
    if (foundSalesRep) {
      setSelectedSalesRep(foundSalesRep);
      setSalesRepInput(`${foundSalesRep.code} - ${foundSalesRep.name}`);
      return true;
    }
    return false;
  };

  const findProductByCode = (code) => {
    const foundProduct = products.find(p => p.code && p.code.toString() === code);
    if (foundProduct) {
      setSelectedProduct(foundProduct);
      setCustomPrice(foundProduct.price);
      setProductInput(`${foundProduct.code} - ${foundProduct.name}`);
      return true;
    }
    return false;
  };

  // Handle manual code input
  const handleCustomerInputChange = (e) => {
    const value = e.target.value;
    setCustomerInput(value);
    
    // Check if input is just a code number
    const codeMatch = value.match(/^(\d+)$/);
    if (codeMatch) {
      findCustomerByCode(codeMatch[1]);
    } else if (!value) {
      setSelectedCustomer(null);
    }
  };

  const handleSalesRepInputChange = (e) => {
    const value = e.target.value;
    setSalesRepInput(value);
    
    // Check if input is just a code number
    const codeMatch = value.match(/^(\d+)$/);
    if (codeMatch) {
      findSalesRepByCode(codeMatch[1]);
    } else if (!value) {
      setSelectedSalesRep(null);
    }
  };

  const handleProductInputChange = (e) => {
    const value = e.target.value;
    setProductInput(value);
    
    // Check if input is just a code number
    const codeMatch = value.match(/^(\d+)$/);
    if (codeMatch) {
      findProductByCode(codeMatch[1]);
    } else if (!value) {
      setSelectedProduct(null);
      setCustomPrice(0);
    }
  };

  useEffect(() => {
    if (selectedProduct) {
      setCustomPrice(selectedProduct.price);
    }
  }, [selectedProduct]);

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

    // Use custom price instead of product price
    const priceToUse = customPrice !== null ? customPrice : selectedProduct.price;

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
        price: priceToUse,
        unitPrice: priceToUse,
        total: priceToUse * quantity
      }]);
    }
    
    // Reset product selection after adding to order
    setSelectedProduct(null);
    setProductInput('');
    setQuantity(1);
    setCustomPrice(0);
    
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
    setQuantity(1);
    setCustomPrice(0);
    setCustomerInput('');
    setSalesRepInput('');
    setProductInput('');
    setPaymentMethod('');
    setSelectedPaymentTable('');
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
      
      const orderData = {
        customerId: selectedCustomer.id,
        customerName: selectedCustomer.name,
        salesRepId: selectedSalesRep.id,
        salesRepName: selectedSalesRep.name,
        items: orderItems,
        total: calculateTotal(),
        status: "draft" as Order["status"],
        paymentStatus: "pending" as Order["paymentStatus"],
        paymentMethod: paymentMethod || undefined,
        paymentTableId: selectedPaymentTable || undefined,
        createdAt: new Date(),
        deliveryAddress: selectedCustomer.address,
        deliveryCity: selectedCustomer.city,
        deliveryState: selectedCustomer.state,
        deliveryZipCode: selectedCustomer.zipCode
      };
      
      const orderId = await addOrder(orderData);
      
      if (orderId) {
        toast({
          title: "Pedido Criado",
          description: `Pedido #${orderId.substring(0, 6)} criado com sucesso.`
        });
        
        resetForm();
        
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

  const filteredCustomers = customers.filter(customer => 
    customer.name.toLowerCase().includes(customerSearch.toLowerCase()) ||
    customer.code?.toString().includes(customerSearch)
  );

  const filteredSalesReps = salesReps.filter(rep => 
    rep.name.toLowerCase().includes(salesRepSearch.toLowerCase()) ||
    rep.code?.toString().includes(salesRepSearch)
  );

  const filteredProducts = products.filter(product => 
    product.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    product.code?.toString().includes(productSearch) ||
    product.price?.toString().includes(productSearch)
  );

  // Helper function to parse price from Brazilian format to number
  const parsePrice = (priceStr) => {
    if (!priceStr) return 0;
    
    // Remove R$ symbol and any dots, replace comma with dot for decimal
    const cleanPriceStr = priceStr.replace(/[^\d,]/g, '').replace(',', '.');
    return parseFloat(cleanPriceStr) || 0;
  };

  // Get recent orders for a customer
  const getRecentCustomerOrders = () => {
    if (!selectedCustomer) return [];
    
    return useAppContext().orders
      .filter(order => order.customerId === selectedCustomer.id)
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, 10); // Get the 10 most recent orders
  };

  const handleViewRecentPurchases = () => {
    if (selectedCustomer) {
      setIsRecentPurchasesDialogOpen(true);
    } else {
      toast({
        title: "Atenção",
        description: "Selecione um cliente primeiro para ver compras recentes.",
      });
    }
  };

  // Payment methods from the context
  const paymentMethods = [
    { value: 'cash', label: 'Dinheiro' },
    { value: 'credit', label: 'Cartão de Crédito' },
    { value: 'debit', label: 'Cartão de Débito' },
    { value: 'transfer', label: 'Transferência' },
    { value: 'check', label: 'Cheque' },
    { value: 'custom', label: 'Personalizado' }
  ];

  return (
    <PageLayout title="Novo Pedido">
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ShoppingCart size={20} /> Informações do Pedido
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <Label htmlFor="customer">Cliente</Label>
                {selectedCustomer && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="sm" 
                    className="h-8 text-xs"
                    onClick={handleViewRecentPurchases}
                  >
                    Ver compras recentes
                  </Button>
                )}
              </div>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  id="customer"
                  placeholder="Digite o código do cliente"
                  value={customerInput}
                  onChange={handleCustomerInputChange}
                  className="w-full"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setIsCustomerSearchOpen(true)}
                  className="shrink-0"
                >
                  <Search size={18} />
                </Button>
                {selectedCustomer && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setSelectedCustomer(null);
                      setCustomerInput('');
                    }}
                    className="shrink-0"
                  >
                    <X size={18} />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="salesRep">Vendedor</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  id="salesRep"
                  placeholder="Digite o código do vendedor"
                  value={salesRepInput}
                  onChange={handleSalesRepInputChange}
                  className="w-full"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setIsSalesRepSearchOpen(true)}
                  className="shrink-0"
                >
                  <Search size={18} />
                </Button>
                {selectedSalesRep && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setSelectedSalesRep(null);
                      setSalesRepInput('');
                    }}
                    className="shrink-0"
                  >
                    <X size={18} />
                  </Button>
                )}
              </div>
            </div>
            
            {/* Payment section */}
            <div className="pt-4 border-t">
              <h3 className="font-medium flex items-center mb-3">
                <CreditCard size={18} className="mr-2" /> Informações de Pagamento
              </h3>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Forma de Pagamento</Label>
                  <Select
                    value={paymentMethod}
                    onValueChange={setPaymentMethod}
                  >
                    <SelectTrigger id="paymentMethod">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentMethods.map(method => (
                        <SelectItem key={method.value} value={method.value}>
                          {method.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="paymentTable">Tabela de Pagamento</Label>
                  <Select
                    value={selectedPaymentTable}
                    onValueChange={setSelectedPaymentTable}
                  >
                    <SelectTrigger id="paymentTable">
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {paymentTables.filter(table => table.active).map(table => (
                        <SelectItem key={table.id} value={table.id}>
                          {table.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle>Adicionar Produtos</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="product">Produto</Label>
              <div className="flex items-center gap-2">
                <Input
                  type="text"
                  id="product"
                  placeholder="Digite o código do produto"
                  value={productInput}
                  onChange={handleProductInputChange}
                  className="w-full"
                />
                <Button 
                  type="button" 
                  variant="outline" 
                  size="icon" 
                  onClick={() => setIsProductSearchOpen(true)}
                  className="shrink-0"
                >
                  <Search size={18} />
                </Button>
                {selectedProduct && (
                  <Button 
                    type="button" 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => {
                      setSelectedProduct(null);
                      setProductInput('');
                      setCustomPrice(0);
                    }}
                    className="shrink-0"
                  >
                    <X size={18} />
                  </Button>
                )}
              </div>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="quantity">Quantidade</Label>
              <Input
                type="number"
                id="quantity"
                value={quantity}
                onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                min="1"
                className="w-full"
              />
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="price">Preço (R$)</Label>
              <Input
                type="text"
                id="price"
                mask="price"
                value={customPrice ? customPrice.toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '0,00'}
                onChange={(e) => setCustomPrice(parsePrice(e.target.value))}
                className="w-full"
              />
            </div>
            
            <Button onClick={handleAddItem} className="w-full">
              <Plus size={16} className="mr-2" /> Adicionar ao Pedido
            </Button>
            
            {selectedProduct && (
              <div className="p-3 bg-gray-50 rounded-md mt-4">
                <p className="font-medium">{selectedProduct.name}</p>
                <p className="text-sm text-gray-500">{selectedProduct.description}</p>
                <div className="flex justify-between mt-1">
                  <p>Preço original:</p>
                  <p className="font-semibold">
                    {selectedProduct.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </p>
                </div>
                {customPrice !== selectedProduct.price && customPrice !== null && (
                  <div className="flex justify-between mt-1">
                    <p>Preço personalizado:</p>
                    <p className="font-semibold text-sales-700">
                      {customPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

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

      {/* Customer Search Dialog */}
      <Dialog open={isCustomerSearchOpen} onOpenChange={setIsCustomerSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <Command className="rounded-lg border shadow-md">
            <CommandInput 
              placeholder="Buscar cliente por código ou nome..." 
              value={customerSearch}
              onValueChange={setCustomerSearch}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>Nenhum cliente encontrado.</CommandEmpty>
              <CommandGroup heading="Clientes">
                {filteredCustomers.map((customer) => (
                  <CommandItem
                    key={customer.id}
                    value={customer.id}
                    onSelect={() => {
                      setSelectedCustomer(customer);
                      setCustomerInput(`${customer.code} - ${customer.name}`);
                      setIsCustomerSearchOpen(false);
                      setCustomerSearch('');
                    }}
                    className="cursor-pointer"
                  >
                    <span className="font-medium mr-2">{customer.code}</span>
                    <span>{customer.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      {/* SalesRep Search Dialog */}
      <Dialog open={isSalesRepSearchOpen} onOpenChange={setIsSalesRepSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <Command className="rounded-lg border shadow-md">
            <CommandInput 
              placeholder="Buscar vendedor por código ou nome..." 
              value={salesRepSearch}
              onValueChange={setSalesRepSearch}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>Nenhum vendedor encontrado.</CommandEmpty>
              <CommandGroup heading="Vendedores">
                {filteredSalesReps.map((salesRep) => (
                  <CommandItem
                    key={salesRep.id}
                    value={salesRep.id}
                    onSelect={() => {
                      setSelectedSalesRep(salesRep);
                      setSalesRepInput(`${salesRep.code} - ${salesRep.name}`);
                      setIsSalesRepSearchOpen(false);
                      setSalesRepSearch('');
                    }}
                    className="cursor-pointer"
                  >
                    <span className="font-medium mr-2">{salesRep.code}</span>
                    <span>{salesRep.name}</span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      {/* Product Search Dialog */}
      <Dialog open={isProductSearchOpen} onOpenChange={setIsProductSearchOpen}>
        <DialogContent className="sm:max-w-md">
          <Command className="rounded-lg border shadow-md">
            <CommandInput 
              placeholder="Buscar produto por código, nome ou preço..." 
              value={productSearch}
              onValueChange={setProductSearch}
              className="h-9"
            />
            <CommandList>
              <CommandEmpty>Nenhum produto encontrado.</CommandEmpty>
              <CommandGroup heading="Produtos">
                {filteredProducts.map((product) => (
                  <CommandItem
                    key={product.id}
                    value={product.id}
                    onSelect={() => {
                      setSelectedProduct(product);
                      setProductInput(`${product.code} - ${product.name}`);
                      // Update custom price when selecting a product
                      setCustomPrice(product.price);
                      setIsProductSearchOpen(false);
                      setProductSearch('');
                    }}
                    className="cursor-pointer"
                  >
                    <span className="font-medium mr-2">{product.code || '—'}</span>
                    <span className="flex-1">{product.name}</span>
                    <span className="text-right text-muted-foreground">
                      {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </CommandItem>
                ))}
              </CommandGroup>
            </CommandList>
          </Command>
        </DialogContent>
      </Dialog>

      {/* Recent Purchases Dialog */}
      <Dialog open={isRecentPurchasesDialogOpen} onOpenChange={setIsRecentPurchasesDialogOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>
              Compras Recentes - {selectedCustomer?.name}
            </DialogTitle>
          </DialogHeader>
          <div className="mt-2 max-h-[60vh] overflow-auto">
            {selectedCustomer && (
              <>
                {getRecentCustomerOrders().length > 0 ? (
                  <div className="space-y-4">
                    {getRecentCustomerOrders().map((order) => (
                      <div key={order.id} className="border rounded-md p-3">
                        <div className="flex justify-between items-center mb-2">
                          <div>
                            <span className="font-medium text-lg">Pedido #{order.id.substring(0, 8)}</span>
                            <span className="text-sm text-gray-500 ml-2">
                              {new Date(order.createdAt).toLocaleDateString('pt-BR')}
                            </span>
                          </div>
                          <span className="font-semibold">
                            {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                        <table className="w-full text-sm">
                          <thead className="bg-gray-50">
                            <tr>
                              <th className="px-2 py-1 text-left">Produto</th>
                              <th className="px-2 py-1 text-center">Qtd</th>
                              <th className="px-2 py-1 text-right">Valor</th>
                            </tr>
                          </thead>
                          <tbody>
                            {order.items.map((item) => (
                              <tr key={item.id} className="border-t">
                                <td className="px-2 py-1">{item.productName}</td>
                                <td className="px-2 py-1 text-center">{item.quantity}</td>
                                <td className="px-2 py-1 text-right">
                                  {item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-gray-500">
                    Este cliente não tem compras registradas.
                  </div>
                )}
              </>
            )}
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
