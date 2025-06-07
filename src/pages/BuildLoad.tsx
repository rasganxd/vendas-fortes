
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
import { toast } from 'sonner';
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

  // Debug logging
  useEffect(() => {
    console.log('🔍 [BuildLoad] Context data:', {
      salesRepsCount: salesReps.length,
      vehiclesCount: vehicles.length,
      ordersCount: orders.length,
      addLoadType: typeof addLoad
    });
  }, [salesReps, vehicles, orders, addLoad]);

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
    console.log('🔍 [BuildLoad] Validating form:', {
      loadName,
      selectedVehicleId,
      selectedSalesRepId,
      selectedOrderIds: selectedOrderIds.length
    });

    if (!loadName) {
      toast.error("Nome da carga é obrigatório");
      return false;
    }
    if (!selectedVehicleId) {
      toast.error("Veículo é obrigatório");
      return false;
    }
    if (!selectedSalesRepId) {
      toast.error("Representante é obrigatório");
      return false;
    }
    if (selectedOrderIds.length === 0) {
      toast.error("Selecione pelo menos um pedido para a carga");
      return false;
    }
    return true;
  };

  const handleSaveLoad = async () => {
    console.log('🚛 [BuildLoad] Starting load save process...');
    
    if (!validateForm()) {
      console.log('❌ [BuildLoad] Form validation failed');
      return;
    }
  
    try {
      setIsSaving(true);
      
      // Get selected vehicle and sales rep names
      const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);
      const selectedSalesRep = salesReps.find(sr => sr.id === selectedSalesRepId);
      
      const loadData = {
        name: loadName,
        vehicleId: selectedVehicleId,
        vehicleName: selectedVehicle?.name,
        date: loadDate,
        status: "pending" as const,
        notes: loadNotes,
        salesRepId: selectedSalesRepId,
        salesRepName: selectedSalesRep?.name,
        orderIds: selectedOrderIds,
        locked: false,
        createdAt: new Date(),
        updatedAt: new Date(),
        total: calculateLoadTotal()
      };
    
      console.log('🚛 [BuildLoad] Creating load with data:', loadData);
      console.log('🔍 [BuildLoad] AddLoad function type:', typeof addLoad);
      
      if (typeof addLoad !== 'function') {
        console.error('❌ [BuildLoad] addLoad is not a function:', addLoad);
        toast.error("Erro interno: função de salvamento não disponível");
        return;
      }

      const loadId = await addLoad(loadData);
      console.log('✅ [BuildLoad] Load created with ID:', loadId);
    
      toast.success("Carregamento criado com sucesso!");
      navigate(`/carregamentos`);
    } catch (error) {
      console.error("❌ [BuildLoad] Error creating load:", error);
      toast.error("Ocorreu um erro ao salvar o carregamento.");
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
