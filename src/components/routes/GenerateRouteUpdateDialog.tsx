
import { useState } from 'react';
import { SalesRep } from '@/types';
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
import { RefreshCw } from 'lucide-react';

interface GenerateRouteUpdateDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  routeId: string;
  routeName: string;
  salesReps: SalesRep[];
  onGenerateUpdate: (routeId: string, salesRepId: string) => Promise<number>;
}

export const GenerateRouteUpdateDialog = ({ 
  open, 
  onOpenChange, 
  routeId, 
  routeName, 
  salesReps, 
  onGenerateUpdate 
}: GenerateRouteUpdateDialogProps) => {
  const [selectedSalesRepId, setSelectedSalesRepId] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const handleGenerateUpdate = async () => {
    if (!selectedSalesRepId) return;
    
    try {
      setIsGenerating(true);
      await onGenerateUpdate(routeId, selectedSalesRepId);
      onOpenChange(false);
      setSelectedSalesRepId('');
    } catch (error) {
      console.error('Error generating update:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Gerar Atualização da Rota</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <p className="text-sm text-gray-600 mb-4">
              Rota: <strong>{routeName}</strong>
            </p>
            <p className="text-sm text-gray-600 mb-4">
              Selecione o vendedor para sincronizar todos os seus clientes com esta rota:
            </p>
          </div>
          
          <div>
            <label htmlFor="salesRep" className="block text-sm font-medium text-gray-700 mb-1">
              Vendedor
            </label>
            <Select
              value={selectedSalesRepId}
              onValueChange={setSelectedSalesRepId}
            >
              <SelectTrigger id="salesRep">
                <SelectValue placeholder="Selecionar vendedor" />
              </SelectTrigger>
              <SelectContent>
                {salesReps && salesReps.length > 0 ? (
                  salesReps.map(salesRep => (
                    <SelectItem key={salesRep.id} value={salesRep.id}>
                      {salesRep.name} (Código: {salesRep.code})
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>Nenhum vendedor cadastrado</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
          
          <div className="bg-blue-50 p-3 rounded-md">
            <p className="text-sm text-blue-800">
              <strong>Atenção:</strong> Todos os clientes do vendedor selecionado serão vinculados a esta rota 
              e aparecerão no aplicativo mobile quando o vendedor fizer a sincronização.
            </p>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            className="bg-sales-800 hover:bg-sales-700"
            onClick={handleGenerateUpdate}
            disabled={!selectedSalesRepId || isGenerating}
          >
            {isGenerating ? (
              <>
                <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                Gerando...
              </>
            ) : (
              <>
                <RefreshCw className="mr-2 h-4 w-4" />
                Gerar Atualização
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
