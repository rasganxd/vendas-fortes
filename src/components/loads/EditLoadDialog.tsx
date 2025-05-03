
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Load, LoadItem } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { LoadDetailsTab } from './LoadDetailsTab';
import { LoadOrdersTab } from './LoadOrdersTab';

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
  const [currentItems, setCurrentItems] = useState<LoadItem[]>([]);
  
  // Reset form when dialog opens with new load data
  useEffect(() => {
    if (load && open) {
      setName(load.name || '');
      // Map any route status to one of our acceptable values
      setStatus(load.status || 'planning');
      setNotes(load.notes || '');
      // Set current items
      setCurrentItems(load.items || []);
      // Reset tabs and search
      setTab('details');
    }
  }, [load, open]);
  
  const handleSave = async () => {
    if (!load) return;
    
    setIsLoading(true);
    
    // Extract all unique order IDs from current items
    const orderIds = Array.from(new Set(currentItems.map(item => item.orderId || '').filter(id => id !== '')));
    
    const updatedLoad: Partial<Load> = {
      name,
      status: status as Load['status'], // Cast to the correct type
      notes,
      items: currentItems,
      orderIds: orderIds
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
          
          <TabsContent value="details">
            <LoadDetailsTab
              name={name}
              setName={setName}
              status={status}
              setStatus={setStatus}
              notes={notes}
              setNotes={setNotes}
              currentItems={currentItems}
            />
          </TabsContent>
          
          <TabsContent value="orders">
            <LoadOrdersTab
              currentItems={currentItems}
              setCurrentItems={setCurrentItems}
            />
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
