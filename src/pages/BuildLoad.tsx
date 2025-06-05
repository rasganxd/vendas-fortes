
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
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Order } from '@/types';
import { toast } from '@/components/ui/use-toast';
import OrderSelectionSection from '@/components/loads/OrderSelectionSection';
import LoadSummarySection from '@/components/loads/LoadSummarySection';

export default function BuildLoad() {
  const navigate = useNavigate();
  const { salesReps, vehicles, addLoad, orders } = useAppContext();
  const [loadName, setLoadName] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [loadDate, setLoadDate] = useState(new Date());
  const [loadNotes, setLoadNotes] = useState('');
  const [selectedSalesRepId, setSelectedSalesRepId] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectAll, setSelectAll] = useState(false);

  const handleOrderSelect = (order: Order, isChecked: boolean) => {
    if (isChecked) {
      setSelectedOrderIds(prev => [...prev, order.id]);
    } else {
      setSelectedOrderIds(prev => prev.filter(id => id !== order.id));
      setSelectAll(false);
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const availableOrders = orders.filter(order => 
        (order.status === 'pending' || order.status === 'confirmed') &&
        !order.archived
      );
      setSelectedOrderIds(availableOrders.map(order => order.id));
    } else {
      setSelectedOrderIds([]);
    }
  };

  const calculateLoadTotal = (): number => {
    const selectedOrders = orders.filter(order => selectedOrderIds.includes(order.id));
    return selectedOrders.reduce((total, order) => total + order.total, 0);
  };

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
    if (selectedOrderIds.length === 0) {
      toast({
        title: "Erro",
        description: "Selecione pelo menos um pedido para a carga",
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
        status: "pending" as const,
        notes: loadNotes,
        salesRepId: selectedSalesRepId,
        orderIds: selectedOrderIds,
        locked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        total: calculateLoadTotal()
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

  return (
    <PageLayout title="Montar Carga">
      <div className="space-y-6">
        {/* Load Basic Info */}
        <Card>
          <CardHeader>
            <CardTitle>Informações da Carga</CardTitle>
            <CardDescription>
              Preencha os dados básicos para montar uma nova carga
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
                        {vehicle.name} - {vehicle.licensePlate}
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
          </CardContent>
        </Card>

        {/* Order Selection */}
        <OrderSelectionSection
          selectedOrderIds={selectedOrderIds}
          onOrderSelect={handleOrderSelect}
          selectAll={selectAll}
          onSelectAll={handleSelectAll}
        />

        {/* Load Summary */}
        <LoadSummarySection selectedOrderIds={selectedOrderIds} />

        {/* Save Button */}
        <Card>
          <CardContent className="pt-6">
            <Button
              className="w-full bg-sales-800 hover:bg-sales-700"
              onClick={handleSaveLoad}
              disabled={isSaving || selectedOrderIds.length === 0}
            >
              {isSaving ? 'Salvando Carga...' : 'Criar Carga'}
            </Button>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
