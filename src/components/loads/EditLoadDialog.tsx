import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter,
  DialogTrigger
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Load, Order, OrderItem, LoadItem } from '@/types';
import { useAppContext } from '@/hooks/useAppContext';
import { Plus, Search, X, Check, Trash } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { Badge } from '@/components/ui/badge';
import { v4 as uuid } from 'uuid';
import { Checkbox } from '@/components/ui/checkbox';

interface EditLoadDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  load: Load | null;
  onSave: (id: string, updatedLoad: Partial<Load>) => Promise<void>;
}

export const EditLoadDialog = ({ open, onOpenChange, load, onSave }: EditLoadDialogProps) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<string>('planning');
  const [notes, setNotes] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  const [tab, setTab] = useState('details');
  const [search, setSearch] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const { orders } = useAppContext();
  const [currentItems, setCurrentItems] = useState<LoadItem[]>([]);
  
  // Reset form when dialog opens with new load data
  useEffect(() => {
    if (load && open) {
      setName(load.name);
      setStatus(load.status || 'planning');
      setNotes(load.notes || '');
      // Set current items
      setCurrentItems(load.items || []);
      // Reset tabs and search
      setTab('details');
      setSearch('');
      setSelectedOrderIds([]);
    }
  }, [load, open]);
  
  const handleSave = async () => {
    if (!load) return;
    
    setIsLoading(true);
    
    const updatedLoad: Partial<Load> = {
      name,
      status,
      notes,
      items: currentItems,
      // Update orderIds based on current items
      orderIds: Array.from(new Set(currentItems.map(item => item.orderId || ''))).filter(id => id !== '')
    };
    
    try {
      await onSave(load.id, updatedLoad);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating load:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Filter orders that aren't already part of the load
  const filteredOrders = orders.filter(order => {
    const isInLoad = currentItems.some(item => item.orderId === order.id);
    const matchesSearch = order.customerName.toLowerCase().includes(search.toLowerCase()) || 
                          order.id.toLowerCase().includes(search.toLowerCase());
    return !isInLoad && matchesSearch;
  });

  const handleOrderSelect = (order: Order, isChecked: boolean) => {
    if (isChecked) {
      if (!selectedOrderIds.includes(order.id)) {
        setSelectedOrderIds(prev => [...prev, order.id]);
      }
    } else {
      setSelectedOrderIds(prev => prev.filter(id => id !== order.id));
    }
  };

  const handleAddSelectedOrders = () => {
    if (selectedOrderIds.length === 0) {
      toast({
        title: "Nenhum pedido selecionado",
        description: "Selecione pelo menos um pedido para adicionar à carga.",
        variant: "destructive"
      });
      return;
    }

    const ordersToAdd = orders.filter(order => selectedOrderIds.includes(order.id));
    
    const newLoadItems: LoadItem[] = [];
    ordersToAdd.forEach(order => {
      order.items.forEach(item => {
        newLoadItems.push({
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          orderItems: [item]
        });
      });
    });

    setCurrentItems(prevItems => [...prevItems, ...newLoadItems]);
    setSelectedOrderIds([]);
    setSearch('');
    
    toast({
      title: "Pedidos adicionados",
      description: `${ordersToAdd.length} pedido(s) adicionado(s) à carga.`
    });
  };

  const handleRemoveOrder = (orderId: string) => {
    setCurrentItems(prevItems => prevItems.filter(item => item.orderId !== orderId));
    
    toast({
      title: "Pedido removido",
      description: "O pedido foi removido da carga."
    });
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Editar Carga</DialogTitle>
        </DialogHeader>
        
        <Tabs value={tab} onValueChange={setTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="details">Detalhes</TabsTrigger>
            <TabsTrigger value="orders">Gerenciar Pedidos</TabsTrigger>
          </TabsList>
          
          <TabsContent value="details" className="space-y-4">
            <div className="grid gap-4 py-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Nome da Carga</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Nome da carga"
                />
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="status">Status</Label>
                <Select value={status} onValueChange={(value: string) => setStatus(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="planning">Planejamento</SelectItem>
                    <SelectItem value="loading">Carregando</SelectItem>
                    <SelectItem value="loaded">Carregado</SelectItem>
                    <SelectItem value="in-transit">Em Trânsito</SelectItem>
                    <SelectItem value="delivered">Entregue</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="grid gap-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observações sobre a carga"
                  rows={3}
                />
              </div>
              
              {currentItems.length > 0 && (
                <div className="grid gap-2 mt-4">
                  <Label>Itens da carga</Label>
                  <div className="border rounded-md overflow-hidden">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Pedido</TableHead>
                          <TableHead>Produto</TableHead>
                          <TableHead className="text-right">Quantidade</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {currentItems.map((item, index) => (
                          <TableRow key={index}>
                            <TableCell>{item.orderId?.substring(0, 8)}</TableCell>
                            <TableCell>{item.productName}</TableCell>
                            <TableCell className="text-right">{item.quantity}</TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                  <p className="text-sm text-gray-500 mt-2">
                    Para adicionar ou remover pedidos, use a aba "Gerenciar Pedidos".
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="orders">
            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Pedidos na Carga</h3>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead className="text-right">Ações</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {Array.from(
                        new Set(currentItems.map(item => item.orderId))
                      ).map(orderId => {
                        const order = orders.find(o => o.id === orderId);
                        return (
                          <TableRow key={orderId}>
                            <TableCell>{orderId?.substring(0, 8)}</TableCell>
                            <TableCell>{order?.customerName || "Cliente não encontrado"}</TableCell>
                            <TableCell className="text-right">
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleRemoveOrder(orderId || '')}
                                className="text-red-500 hover:text-red-700 hover:bg-red-100"
                              >
                                <Trash size={16} />
                                <span className="ml-1">Remover</span>
                              </Button>
                            </TableCell>
                          </TableRow>
                        );
                      })}
                      {currentItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-center py-4">
                            Nenhum pedido adicionado à carga
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
              
              <div className="border-t pt-4 mt-4">
                <h3 className="text-sm font-medium mb-2">Adicionar Pedidos</h3>
                <div className="flex gap-2 mb-4">
                  <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                    <Input
                      placeholder="Buscar pedidos..."
                      value={search}
                      onChange={(e) => setSearch(e.target.value)}
                      className="pl-10"
                    />
                  </div>
                  <Button 
                    className="bg-sales-800 hover:bg-sales-700" 
                    onClick={handleAddSelectedOrders}
                    disabled={selectedOrderIds.length === 0}
                  >
                    <Plus size={16} className="mr-2" /> Adicionar
                  </Button>
                </div>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-10">Sel.</TableHead>
                        <TableHead>Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Itens</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {filteredOrders.map((order) => (
                        <TableRow key={order.id}>
                          <TableCell>
                            <Checkbox 
                              checked={selectedOrderIds.includes(order.id)}
                              onCheckedChange={(checked) => handleOrderSelect(order, !!checked)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{order.items.length} item(s)</TableCell>
                        </TableRow>
                      ))}
                      {filteredOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={4} className="text-center py-4">
                            Não há pedidos disponíveis para adicionar
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </div>
            </div>
          </TabsContent>
        </Tabs>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading || !name || !status}
            className="bg-sales-800 hover:bg-sales-700"
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
