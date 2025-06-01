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
  return <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <div className="relative">
          
          
          {pendingOrdersCount > 0 && !isImporting && <div className="absolute -top-2 -right-2">
              <div className="bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
                {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
              </div>
            </div>}
        </div>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone size={20} />
            Importar Pedidos Mobile
          </DialogTitle>
        </DialogHeader>
        
        <SalesRepImportSelector onImportSalesRep={handleImportSalesRep} onImportAll={handleImportAll} isImporting={isImporting} />
      </DialogContent>
    </Dialog>;
}