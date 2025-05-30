
import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Smartphone, Download, RefreshCw } from 'lucide-react';
import { useMobileOrderImport } from '@/hooks/useMobileOrderImport';
import SalesRepImportSelector from './SalesRepImportSelector';

interface MobileOrderImportButtonProps {
  onImportComplete?: () => void;
}

export default function MobileOrderImportButton({
  onImportComplete
}: MobileOrderImportButtonProps) {
  const {
    importMobileOrders,
    importSalesRepOrders,
    isImporting,
    pendingOrdersCount,
    checkPendingOrders
  } = useMobileOrderImport();
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  useEffect(() => {
    // Check for pending orders on mount
    checkPendingOrders();

    // Set up interval to check periodically
    const interval = setInterval(checkPendingOrders, 30000); // Check every 30 seconds

    return () => clearInterval(interval);
  }, [checkPendingOrders]);

  const handleImportAll = async () => {
    const result = await importMobileOrders();
    if (result.success && onImportComplete) {
      onImportComplete();
    }

    // Fechar dialog após importação bem-sucedida
    if (result.success) {
      setIsDialogOpen(false);
    }
  };

  const handleImportSalesRep = async (salesRepId: string, salesRepName: string) => {
    const result = await importSalesRepOrders(salesRepId, salesRepName);
    if (result.success && onImportComplete) {
      onImportComplete();
    }

    // Fechar dialog após importação bem-sucedida
    if (result.success) {
      setIsDialogOpen(false);
    }
  };

  if (pendingOrdersCount === 0) {
    return null; // Don't show button if no pending orders
  }

  return (
    <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Smartphone size={16} className="mr-2" />
          Importar Pedidos Mobile
          {pendingOrdersCount > 0 && !isImporting && (
            <Badge variant="secondary" className="ml-2">
              {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
            </Badge>
          )}
          {isImporting && <RefreshCw size={16} className="ml-2 animate-spin" />}
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone size={20} />
            Importar Pedidos Mobile
          </DialogTitle>
        </DialogHeader>
        
        <SalesRepImportSelector 
          onImportSalesRep={handleImportSalesRep} 
          onImportAll={handleImportAll} 
          isImporting={isImporting} 
        />
      </DialogContent>
    </Dialog>
  );
}
