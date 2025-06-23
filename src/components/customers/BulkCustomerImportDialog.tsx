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
      console.log('🔄 [BulkImport] First customer sample:', customers[0]);
      
      const results: string[] = [];
      
      for (let i = 0; i < customers.length; i++) {
        const customer = customers[i];
        console.log(`🔄 [BulkImport] Importing customer ${i + 1}/${customers.length}:`, customer.name);
        console.log(`📝 [BulkImport] Customer data:`, JSON.stringify(customer, null, 2));
        
        try {
          console.log(`🔄 [BulkImport] Calling addCustomer for: ${customer.name}`);
          const id = await addCustomer(customer);
          console.log(`📋 [BulkImport] addCustomer returned:`, id);
          
          if (id && id !== "") {
            results.push(id);
            console.log(`✅ [BulkImport] Successfully imported customer: ${customer.name} with ID: ${id}`);
          } else {
            console.error(`❌ [BulkImport] Failed to import customer: ${customer.name} - No ID returned or empty ID`);
            console.error(`❌ [BulkImport] Returned value:`, id, typeof id);
            throw new Error(`Falha ao importar cliente ${customer.name} - ID não retornado`);
          }
        } catch (error) {
          console.error(`❌ [BulkImport] Error importing customer ${customer.name}:`, error);
          console.error(`❌ [BulkImport] Error type:`, typeof error);
          console.error(`❌ [BulkImport] Error details:`, {
            message: error instanceof Error ? error.message : 'Unknown error',
            stack: error instanceof Error ? error.stack : undefined
          });
          
          // Show individual error but continue with next customer
          console.log(`⚠️ [BulkImport] Skipping customer ${customer.name} due to error, continuing with next...`);
          continue; // Skip this customer and continue with the next one
        }
      }
      
      console.log('🎉 [BulkImport] Bulk import completed!', results.length, 'customers imported successfully');
      
      if (results.length > 0) {
        console.log(`✅ [BulkImport] Success: ${results.length} customers imported`);
        toast({
          title: "✅ Importação concluída",
          description: `${results.length} cliente(s) importado(s) com sucesso!`
        });
        
        // Close dialog after successful import
        onOpenChange(false);
      } else {
        console.warn(`⚠️ [BulkImport] No customers were imported successfully`);
        toast({
          title: "⚠️ Nenhum cliente importado",
          description: "Não foi possível importar nenhum cliente. Verifique os dados e tente novamente.",
          variant: "destructive"
        });
      }
      
      return results;
    } catch (error) {
      console.error('❌ [BulkImport] Critical error during bulk import:', error);
      console.error('❌ [BulkImport] Critical error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      
      toast({
        title: "❌ Erro na importação",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
      throw error;
    } finally {
      setIsImporting(false);
      console.log('🏁 [BulkImport] Import process finished, setting isImporting to false');
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-6xl w-[95vw] h-[95vh] flex flex-col">
        <DialogHeader>
          <DialogTitle>Importação em Massa de Clientes</DialogTitle>
        </DialogHeader>
        <div className="flex-1 overflow-hidden">
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
