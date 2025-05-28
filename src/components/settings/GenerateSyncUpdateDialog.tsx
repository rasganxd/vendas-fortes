
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { RefreshCw, Users, Database } from 'lucide-react';
import { SalesRep } from '@/types';

interface GenerateSyncUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  salesReps: SalesRep[];
  onGenerateUpdate: (salesRepId: string | null, dataTypes: string[], description: string) => Promise<void>;
}

const AVAILABLE_DATA_TYPES = [
  { value: 'customers', label: 'Clientes' },
  { value: 'products', label: 'Produtos' },
  { value: 'payment_tables', label: 'Tabelas de Pagamento' },
  { value: 'product_categories', label: 'Categorias de Produtos' },
  { value: 'product_groups', label: 'Grupos de Produtos' },
  { value: 'product_brands', label: 'Marcas de Produtos' },
  { value: 'delivery_routes', label: 'Rotas de Entrega' },
];

export const GenerateSyncUpdateDialog: React.FC<GenerateSyncUpdateDialogProps> = ({
  open,
  onOpenChange,
  salesReps,
  onGenerateUpdate
}) => {
  const [selectedSalesRepId, setSelectedSalesRepId] = useState<string>('all');
  const [selectedDataTypes, setSelectedDataTypes] = useState<string[]>(['customers', 'products']);
  const [description, setDescription] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleDataTypeChange = (dataType: string, checked: boolean) => {
    if (checked) {
      setSelectedDataTypes(prev => [...prev, dataType]);
    } else {
      setSelectedDataTypes(prev => prev.filter(type => type !== dataType));
    }
  };

  const handleGenerate = async () => {
    if (selectedDataTypes.length === 0) return;
    
    try {
      setIsGenerating(true);
      
      const targetSalesRepId = selectedSalesRepId === 'all' ? null : selectedSalesRepId;
      const finalDescription = description || `Atualização de ${selectedDataTypes.join(', ')} para mobile`;
      
      await onGenerateUpdate(targetSalesRepId, selectedDataTypes, finalDescription);
      
      // Reset form
      setSelectedSalesRepId('all');
      setSelectedDataTypes(['customers', 'products']);
      setDescription('');
      onOpenChange(false);
    } catch (error) {
      console.error('Error generating update:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  const selectedSalesRep = salesReps.find(rep => rep.id === selectedSalesRepId);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Database className="h-5 w-5 text-blue-600" />
            Gerar Atualização para Mobile
          </DialogTitle>
        </DialogHeader>
        
        <div className="space-y-6 py-4">
          {/* Sales Rep Selection */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Vendedor de Destino</Label>
            <Select value={selectedSalesRepId} onValueChange={setSelectedSalesRepId}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4" />
                    Todos os Vendedores
                  </div>
                </SelectItem>
                {salesReps.map(rep => (
                  <SelectItem key={rep.id} value={rep.id}>
                    {rep.name} (Código: {rep.code})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {selectedSalesRep && (
              <p className="text-xs text-gray-500">
                Atualização será enviada apenas para: {selectedSalesRep.name}
              </p>
            )}
            {selectedSalesRepId === 'all' && (
              <p className="text-xs text-gray-500">
                Atualização será enviada para todos os vendedores ativos
              </p>
            )}
          </div>

          {/* Data Types Selection */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Tipos de Dados</Label>
            <div className="grid grid-cols-1 gap-3 max-h-48 overflow-y-auto">
              {AVAILABLE_DATA_TYPES.map(dataType => (
                <div key={dataType.value} className="flex items-center space-x-2">
                  <Checkbox
                    id={dataType.value}
                    checked={selectedDataTypes.includes(dataType.value)}
                    onCheckedChange={(checked) => 
                      handleDataTypeChange(dataType.value, checked as boolean)
                    }
                  />
                  <Label htmlFor={dataType.value} className="text-sm">
                    {dataType.label}
                  </Label>
                </div>
              ))}
            </div>
            {selectedDataTypes.length === 0 && (
              <p className="text-xs text-red-600">
                Selecione pelo menos um tipo de dados
              </p>
            )}
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label className="text-sm font-medium">Descrição (Opcional)</Label>
            <Textarea
              placeholder="Descreva o motivo desta atualização..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="min-h-[80px]"
            />
          </div>

          {/* Summary */}
          <div className="bg-blue-50 p-3 rounded-md border border-blue-200">
            <p className="text-sm text-blue-800 font-medium mb-1">Resumo:</p>
            <p className="text-xs text-blue-700">
              • Tipos: {selectedDataTypes.join(', ') || 'Nenhum selecionado'}
            </p>
            <p className="text-xs text-blue-700">
              • Destino: {selectedSalesRepId === 'all' ? 'Todos os vendedores' : selectedSalesRep?.name || 'Vendedor específico'}
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            onClick={handleGenerate}
            disabled={selectedDataTypes.length === 0 || isGenerating}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <Database className="mr-2 h-4 w-4" />
                Gerar Atualização
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
