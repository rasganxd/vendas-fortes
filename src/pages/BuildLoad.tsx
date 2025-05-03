import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/hooks/useAppContext';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Plus, Search, X } from 'lucide-react';
import { LoadItem, Product, SalesRep, Vehicle, Order } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { v4 as uuid } from 'uuid';

export default function BuildLoad() {
  const navigate = useNavigate();
  const { products, salesReps, vehicles, addLoad, orders } = useAppContext();
  const [loadName, setLoadName] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [loadDate, setLoadDate] = useState(new Date());
  const [orderItems, setOrderItems] = useState<LoadItem[]>([]);
  const [loadNotes, setLoadNotes] = useState('');
  const [selectedSalesRepId, setSelectedSalesRepId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState(1);

  const validateForm = (): boolean => {
    if (!loadName) {
      toast({
        title: "Erro",
        description: "Nome da carga é obrigatório",
        variant: "destructive"
      });
      return false;
    }
    if (!selectedVehicleId) {
      toast({
        title: "Erro",
        description: "Veículo é obrigatório",
        variant: "destructive"
      });
      return false;
    }
    if (!selectedSalesRepId) {
      toast({
        title: "Erro",
        description: "Representante é obrigatório",
        variant: "destructive"
      });
      return false;
    }
    if (orderItems.length === 0) {
      toast({
        title: "Erro",
        description: "Adicione pelo menos um item à carga",
        variant: "destructive"
      });
      return false;
    }
    return true;
  };

  const handleSaveLoad = async () => {
    if (!validateForm()) return;
  
    try {
      setIsSaving(true);
      const loadData = {
        name: loadName,
        vehicleId: selectedVehicleId,
        date: loadDate,
        items: orderItems,
        status: "planning" as const,
        notes: loadNotes,
        salesRepId: selectedSalesRepId,
        orderIds: Array.from(new Set(orderItems.map(item => item.orderId || ''))),
        locked: false,
        createdAt: new Date(), // Add missing property
        updatedAt: new Date(), // Add missing property
        total: calculateLoadTotal() // Add missing property
      };
    
      const loadId = await addLoad(loadData);
    
      toast({
        title: "Carregamento criado",
        description: "O carregamento foi criado com sucesso!"
      });
    
      navigate(`/carregamentos`);
    } catch (error) {
      console.error("Erro ao salvar carregamento:", error);
      toast({
        title: "Erro ao salvar",
        description: "Ocorreu um erro ao salvar o carregamento.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const filteredProducts = products.filter(product =>
    product.name.toLowerCase().includes(search.toLowerCase()) ||
    product.code.toString().includes(search)
  );

  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
  };

  const handleAddItem = () => {
    if (!selectedProduct) {
      toast({
        title: "Erro",
        description: "Selecione um produto para adicionar",
        variant: "destructive"
      });
      return;
    }

    if (quantity <= 0) {
      toast({
        title: "Erro",
        description: "Quantidade deve ser maior que zero",
        variant: "destructive"
      });
      return;
    }

    const newLoadItem: LoadItem = {
      id: uuid(),
      productId: selectedProduct.id,
      productName: selectedProduct.name,
      quantity: quantity,
      price: selectedProduct.price, // Add price property
    };

    setOrderItems([...orderItems, newLoadItem]);
    setSelectedProduct(null);
    setQuantity(1);
    setSearch('');
  };

  const handleRemoveItem = (id: string) => {
    setOrderItems(orderItems.filter(item => item.id !== id));
  };

  const calculateLoadTotal = (): number => {
    return orderItems.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId);
      return total + (product ? product.price * item.quantity : 0);
    }, 0);
  };

  const formatCurrency = (value: number | undefined) => {
    if (value === undefined || value === null) return 'R$ 0,00';
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <PageLayout title="Montar Carga">
      <Card>
        <CardHeader>
          <CardTitle>Montar Carga</CardTitle>
          <CardDescription>
            Preencha os dados para montar uma nova carga
          </CardDescription>
        </CardHeader>
        <CardContent className="grid gap-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="loadName">Nome da Carga</Label>
              <Input
                id="loadName"
                placeholder="Nome da carga"
                value={loadName}
                onChange={(e) => setLoadName(e.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="vehicle">Veículo</Label>
              <Select value={selectedVehicleId} onValueChange={setSelectedVehicleId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um veículo" />
                </SelectTrigger>
                <SelectContent>
                  {vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="salesRep">Representante</Label>
              <Select value={selectedSalesRepId} onValueChange={setSelectedSalesRepId}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um representante" />
                </SelectTrigger>
                <SelectContent>
                  {salesReps.map(salesRep => (
                    <SelectItem key={salesRep.id} value={salesRep.id}>
                      {salesRep.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="loadDate">Data da Carga</Label>
              <Input
                type="date"
                id="loadDate"
                value={loadDate.toISOString().split('T')[0]}
                onChange={(e) => setLoadDate(new Date(e.target.value))}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="loadNotes">Observações</Label>
            <Textarea
              id="loadNotes"
              placeholder="Observações sobre a carga"
              value={loadNotes}
              onChange={(e) => setLoadNotes(e.target.value)}
            />
          </div>

          <div>
            <Label>Adicionar Produtos</Label>
            <div className="flex gap-2 mb-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                <Input
                  placeholder="Buscar produtos..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-10"
                />
              </div>
              <Input
                type="number"
                placeholder="Quantidade"
                value={quantity}
                onChange={(e) => setQuantity(Number(e.target.value))}
                className="w-24"
              />
              <Button onClick={handleAddItem} className="bg-sales-800 hover:bg-sales-700">
                <Plus size={16} className="mr-2" /> Adicionar
              </Button>
            </div>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Código</TableHead>
                    <TableHead>Produto</TableHead>
                    <TableHead>Preço</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredProducts.map(product => (
                    <TableRow
                      key={product.id}
                      onClick={() => handleProductSelect(product)}
                      className={`cursor-pointer hover:bg-gray-100 ${selectedProduct?.id === product.id ? 'bg-gray-50' : ''}`}
                    >
                      <TableCell>{product.code}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>{formatCurrency(product.price)}</TableCell>
                      <TableCell className="text-right">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleProductSelect(product)}
                        >
                          Selecionar
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>

          <div>
            <Label>Itens da Carga</Label>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Preço Unitário</TableHead>
                    <TableHead>Total</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {orderItems.map(item => {
                    const product = products.find(p => p.id === item.productId);
                    const itemTotal = product ? product.price * item.quantity : 0;

                    return (
                      <TableRow key={item.id}>
                        <TableCell>{item.productName}</TableCell>
                        <TableCell>{item.quantity}</TableCell>
                        <TableCell>{formatCurrency(product?.price)}</TableCell>
                        <TableCell>{formatCurrency(itemTotal)}</TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item.id || '')}
                            className="text-red-500 hover:text-red-700"
                          >
                            <X size={16} />
                          </Button>
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </div>
          </div>

          <div className="text-right">
            Total da Carga: {formatCurrency(calculateLoadTotal())}
          </div>

          <Button
            className="bg-sales-800 hover:bg-sales-700"
            onClick={handleSaveLoad}
            disabled={isSaving}
          >
            {isSaving ? 'Salvando...' : 'Salvar Carga'}
          </Button>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
