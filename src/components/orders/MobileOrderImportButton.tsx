
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Smartphone, Download, RefreshCw } from 'lucide-react';
import { useMobileOrderImport } from '@/hooks/useMobileOrderImport';

interface MobileOrderImportButtonProps {
  onImportComplete?: () => void;
}

export default function MobileOrderImportButton({ onImportComplete }: MobileOrderImportButtonProps) {
  const { importMobileOrders, isImporting, pendingOrdersCount, checkPendingOrders } = useMobileOrderImport();

  useEffect(() => {
    // Check for pending orders on mount
    checkPendingOrders();
    
    // Set up interval to check periodically
    const interval = setInterval(checkPendingOrders, 30000); // Check every 30 seconds
    
    return () => clearInterval(interval);
  }, [checkPendingOrders]);

  const handleImport = async () => {
    const result = await importMobileOrders();
    
    if (result.success && onImportComplete) {
      onImportComplete();
    }
  };

  if (pendingOrdersCount === 0) {
    return null; // Don't show button if no pending orders
  }

  return (
    <div className="relative">
      <Button
        onClick={handleImport}
        disabled={isImporting}
        variant="outline"
        className="flex items-center gap-2"
      >
        {isImporting ? (
          <RefreshCw size={16} className="animate-spin" />
        ) : (
          <Download size={16} />
        )}
        {isImporting ? 'Importando...' : 'Importar Pedidos Mobile'}
        
        {pendingOrdersCount > 0 && (
          <Badge variant="secondary" className="ml-2">
            {pendingOrdersCount}
          </Badge>
        )}
      </Button>
      
      {pendingOrdersCount > 0 && !isImporting && (
        <div className="absolute -top-2 -right-2">
          <div className="bg-blue-500 text-white text-xs rounded-full w-6 h-6 flex items-center justify-center animate-pulse">
            {pendingOrdersCount > 99 ? '99+' : pendingOrdersCount}
          </div>
        </div>
      )}
    </div>
  );
}
