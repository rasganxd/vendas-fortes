import React, { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Smartphone, Download, RefreshCw, Bug } from 'lucide-react';
import { useMobileOrderImport } from '@/hooks/useMobileOrderImport';
import SalesRepImportSelector from './SalesRepImportSelector';
import { toast } from 'sonner';
interface MobileOrderImportButtonProps {
  onImportComplete?: () => void;
}
export default function MobileOrderImportButton({
  onImportComplete
}: MobileOrderImportButtonProps) {
  const {
    importMobileOrders,
    importSalesRepOrders,
    importOrphanedOrders,
    isImporting,
    pendingOrdersCount,
    checkPendingOrders,
    debugInfo
  } = useMobileOrderImport();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  useEffect(() => {
    console.log('🚀 [DEBUG] MobileOrderImportButton mounted, checking orders...');
    // Check for pending orders on mount with force refresh
    checkPendingOrders(true);

    // Set up interval to check periodically
    const interval = setInterval(() => {
      console.log('⏰ [DEBUG] Periodic check triggered');
      checkPendingOrders();
    }, 30000); // Check every 30 seconds

    return () => {
      console.log('🛑 [DEBUG] MobileOrderImportButton unmounted, clearing interval');
      clearInterval(interval);
    };
  }, [checkPendingOrders]);

  // Force refresh when dialog opens
  useEffect(() => {
    if (isDialogOpen) {
      console.log('🔄 [DEBUG] Dialog opened, forcing data refresh...');
      checkPendingOrders(true);
    }
  }, [isDialogOpen, checkPendingOrders]);
  const handleImportAll = async () => {
    console.log('🚀 [DEBUG] Starting import of ALL pending orders...');
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
    console.log(`🎯 [DEBUG] Starting import for specific sales rep: ${salesRepName}`);
    const result = await importSalesRepOrders(salesRepId, salesRepName);
    if (result.success && onImportComplete) {
      onImportComplete();
    }

    // Fechar dialog após importação bem-sucedida
    if (result.success) {
      setIsDialogOpen(false);
    }
  };
  const handleImportOrphaned = async () => {
    console.log('🔄 [DEBUG] Starting import of orphaned orders...');
    const result = await importOrphanedOrders();
    if (result.success && onImportComplete) {
      onImportComplete();
    }

    // Fechar dialog após importação bem-sucedida
    if (result.success) {
      setIsDialogOpen(false);
    }
  };
  const showDebugInfo = () => {
    toast.info('Debug Info', {
      description: `Última verificação: ${debugInfo.lastCheck}\nPedidos encontrados: ${debugInfo.ordersFound}\nCom vendedor: ${debugInfo.withSalesRep}\nÓrfãos: ${debugInfo.orphaned}${debugInfo.error ? `\nErro: ${debugInfo.error}` : ''}`
    });
  };

  // Show button even if count is 0 for debugging purposes, but indicate no orders
  const showButton = true; // Always show for debugging

  if (!showButton) {
    return null;
  }
  return <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" className="relative">
          <Smartphone size={16} className="mr-2" />
          Importar Pedidos Mobile
          {pendingOrdersCount > 0 && !isImporting && <Badge variant="secondary" className="ml-2">
              {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
            </Badge>}
          {pendingOrdersCount === 0 && !isImporting && <Badge variant="outline" className="ml-2 text-gray-500">
              0
            </Badge>}
          {isImporting && <RefreshCw size={16} className="ml-2 animate-spin" />}
          
          {/* Debug button */}
          
        </Button>
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Smartphone size={20} />
            Importar Pedidos Mobile
            {pendingOrdersCount > 0 && <Badge variant="secondary">{pendingOrdersCount} pendentes</Badge>}
            
            {/* Debug info */}
            
          </DialogTitle>
        </DialogHeader>
        
        <SalesRepImportSelector onImportSalesRep={handleImportSalesRep} onImportAll={handleImportAll} onImportOrphaned={handleImportOrphaned} isImporting={isImporting} />
      </DialogContent>
    </Dialog>;
}