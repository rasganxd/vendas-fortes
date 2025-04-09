
import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { useAppContext } from '@/hooks/useAppContext';
import { useLoads } from '@/hooks/useLoads';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Search } from 'lucide-react';
import { Order, OrderItem, LoadItem } from '@/types';
import { toast } from "@/components/ui/use-toast";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';

// Import the extracted components
import BuildLoadOrdersTable from '@/components/loads/BuildLoadOrdersTable';
import LoadItemsTable from '@/components/loads/LoadItemsTable';
import CreateLoadDialog from '@/components/loads/CreateLoadDialog';

// Define the BuildLoadItem type here since it's specific to this page
export interface BuildLoadItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  status: 'pending' | 'loaded' | 'delivered';
}

export default function BuildLoad() {
  const { orders } = useAppContext();
  const { addLoad, getLockedOrderIds } = useLoads();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [buildLoadItems, setBuildLoadItems] = useState<BuildLoadItem[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [lockedOrderIds, setLockedOrderIds] = useState<string[]>([]);

  useEffect(() => {
    setLockedOrderIds(getLockedOrderIds());
  }, [getLockedOrderIds]);

  // Get the orders that are locked/blocked
  const blockedOrders = orders.filter(order => 
    lockedOrderIds.includes(order.id)
  );

  const filteredOrders = orders.filter(order =>
    (order.customerName.toLowerCase().includes(search.toLowerCase()) ||
    order.id.toLowerCase().includes(search.toLowerCase())) &&
    !selectedOrderIds.includes(order.id) &&
    !lockedOrderIds.includes(order.id)
  );

  const handleOrderSelect = (order: Order, isChecked: boolean) => {
    if (isChecked) {
      if (!selectedOrderIds.includes(order.id)) {
        setSelectedOrderIds(prev => [...prev, order.id]);
      }
    } else {
      setSelectedOrderIds(prev => prev.filter(id => id !== order.id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const newSelectedIds = [
        ...selectedOrderIds,
        ...filteredOrders.map(order => order.id).filter(id => !selectedOrderIds.includes(id))
      ];
      setSelectedOrderIds(newSelectedIds);
    } else {
      const filteredIds = filteredOrders.map(order => order.id);
      setSelectedOrderIds(prev => prev.filter(id => !filteredIds.includes(id)));
    }
  };

  useEffect(() => {
    setSelectAll(false);
  }, [search]);

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
    
    const newLoadItems: BuildLoadItem[] = [];
    ordersToAdd.forEach(order => {
      order.items.forEach(item => {
        newLoadItems.push({
          id: uuid(),
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          status: 'pending'
        });
      });
    });

    setBuildLoadItems(prevItems => [...prevItems, ...newLoadItems]);
    setSelectedOrders(prevOrders => [...prevOrders, ...ordersToAdd]);
    setSelectedOrderIds([]);
    setSelectAll(false);
  };

  const handleRemoveFromLoad = (orderId: string) => {
    setBuildLoadItems(prevItems => prevItems.filter(item => item.orderId !== orderId));
    setSelectedOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
  };

  const handleCreateLoad = async (values: any) => {
    try {
      const uniqueOrderIds = Array.from(new Set(selectedOrders.map(order => order.id)));
      
      const loadItems: LoadItem[] = [];
      
      uniqueOrderIds.forEach(orderId => {
        const order = selectedOrders.find(o => o.id === orderId);
        if (order) {
          order.items.forEach(item => {
            loadItems.push({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              orderId: order.id,
              orderItems: [item]
            });
          });
        }
      });

      const newLoad = {
        name: values.name,
        vehicleId: '',
        date: new Date(),
        items: loadItems,
        status: 'planning' as const,
        notes: values.notes && values.notes.trim() !== '' ? values.notes : null,
        salesRepId: 'default-sales-rep-id',
        orderIds: uniqueOrderIds,
        locked: false,
      };
      
      const loadId = await addLoad(newLoad);
      
      if (loadId) {
        toast({
          title: "Carga criada com sucesso",
          description: "A carga foi salva no sistema."
        });
        
        navigate('/cargas');
      }
    } catch (error) {
      console.error("Erro ao criar carga:", error);
      toast({
        title: "Erro ao criar carga",
        description: "Houve um problema ao salvar a carga.",
        variant: "destructive"
      });
    }
    
    setIsCreateDialogOpen(false);
  };

  return (
    <PageLayout title="Montar Carga">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Selecionar Pedidos</CardTitle>
              <CardDescription>
                Adicione pedidos à carga
              </CardDescription>
            </div>
            <Button 
              className="bg-sales-800 hover:bg-sales-700" 
              onClick={handleAddSelectedOrders}
              disabled={selectedOrderIds.length === 0}
            >
              <Plus size={16} className="mr-2" /> Adicionar Selecionados
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                placeholder="Buscar pedidos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="relative overflow-x-auto rounded-md border">
            <BuildLoadOrdersTable 
              filteredOrders={filteredOrders}
              selectedOrderIds={selectedOrderIds}
              handleOrderSelect={handleOrderSelect}
              selectAll={selectAll}
              handleSelectAll={handleSelectAll}
              blockedOrders={blockedOrders}
            />
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Itens na Carga</CardTitle>
              <CardDescription>
                Lista de itens adicionados à carga
              </CardDescription>
            </div>
            <CreateLoadDialog
              isOpen={isCreateDialogOpen}
              onOpenChange={setIsCreateDialogOpen}
              onCreateLoad={handleCreateLoad}
              isDisabled={buildLoadItems.length === 0}
            />
          </div>
        </CardHeader>
        <CardContent>
          <LoadItemsTable 
            items={buildLoadItems}
            handleRemoveFromLoad={handleRemoveFromLoad}
          />
        </CardContent>
      </Card>
    </PageLayout>
  );
}
