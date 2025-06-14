
import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { useAppData } from '@/context/providers/AppDataProvider';
import BulkCustomerImport from './BulkCustomerImport';
import { Customer } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface BulkCustomerImportDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BulkCustomerImportDialog: React.FC<BulkCustomerImportDialogProps> = ({
  open,
  onOpenChange,
}) => {
  const { addCustomer } = useAppData();
  const [isImporting, setIsImporting] = useState(false);

  const handleImportCustomers = async (customers: Omit<Customer, 'id'>[]): Promise<string[]> => {
    try {
      setIsImporting(true);
      console.log('🔄 [BulkImport] Starting bulk import of', customers.length, 'customers');
      
      const results: string[] = [];
      
      for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];
        console.log(`🔄 [BulkImport] Importing customer ${i + 1}/${customers.length}:`, customer.name);
        
        try {
          const id = await addCustomer(customer);
          if (id) {
            results.push(id);
            console.log(`✅ [BulkImport] Successfully imported customer: ${customer.name}`);
          } else {
            console.error(`❌ [BulkImport] Failed to import customer: ${customer.name} - No ID returned`);
            throw new Error(`Falha ao importar cliente ${customer.name}`);
          }
        } catch (error) {
          console.error(`❌ [BulkImport] Error importing customer ${customer.name}:`, error);
          throw new Error(`Erro ao importar cliente ${customer.name}: ${error instanceof Error ? error.message : 'Erro desconhecido'}`);
        }
      }
      
      console.log('🎉 [BulkImport] Bulk import completed successfully!', results.length, 'customers imported');
      toast({
        title: "✅ Importação concluída",
        description: `${results.length} clientes importados com sucesso!`
      });
      
      // Close dialog after successful import
      onOpenChange(false);
      
      return results;
    } catch (error) {
      console.error('❌ [BulkImport] Critical error during bulk import:', error);
      toast({
        title: "❌ Erro na importação",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsImporting(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader className="flex-shrink-0">
          <DialogTitle>Importação em Massa de Clientes</DialogTitle>
        </DialogHeader>
        <div className="flex-1 min-h-0">
          <BulkCustomerImport
            onImportCustomers={handleImportCustomers}
            isImporting={isImporting}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkCustomerImportDialog;
