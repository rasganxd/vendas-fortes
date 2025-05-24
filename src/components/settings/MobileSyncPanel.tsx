
import React, { useState, useEffect } from 'react';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Loader2, RefreshCw, Smartphone, CheckCircle, AlertCircle, QrCode } from "lucide-react";
import { mobileSyncService, SyncLogEntry } from '@/services/supabase/mobileSyncService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDate } from '@/utils/date-format';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import QRCodeDisplay from './QRCodeDisplay';
import { toast } from '@/components/ui/use-toast';

interface MobileSyncPanelProps {
  salesRepId: string;
}

const MobileSyncPanel: React.FC<MobileSyncPanelProps> = ({ salesRepId }) => {
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'error' | 'info'>('info');
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [connectionData, setConnectionData] = useState<string>('');

  // Clear status message after 5 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const loadSyncLogs = async () => {
    if (!salesRepId) return;
    
    setIsLoading(true);
    try {
      const data = await mobileSyncService.getSyncLogs(salesRepId);
      
      setSyncLogs(data);
      
      if (data && data.length > 0) {
        setLastSynced(new Date(data[0].created_at).toLocaleString());
      }
      
      toast({
        title: "Dados atualizados",
        description: "Os logs de sincronização foram atualizados com sucesso."
      });
    } catch (error) {
      console.error("Error loading sync logs:", error);
      setStatusMessage("Não foi possível carregar os logs de sincronização.");
      setStatusType('error');
      
      toast({
        title: "Erro",
        description: "Não foi possível carregar os logs de sincronização.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = () => {
    try {
      // Generate a unique connection string
      const timestamp = new Date().getTime();
      const randomPart = Math.random().toString(36).substring(2, 10);
      
      // Create connection data object
      const connectionInfo = {
        salesRepId: salesRepId,
        serverUrl: window.location.origin,
        timestamp: timestamp,
        token: `${salesRepId}-${timestamp}-${randomPart}`
      };
      
      // Convert to a string for QR code
      setConnectionData(JSON.stringify(connectionInfo));
      setIsQrDialogOpen(true);
      
      // Log this connection attempt for audit
      console.log("QR Code connection data generated:", connectionInfo);
      
    } catch (error) {
      console.error("Error generating QR code:", error);
      setStatusMessage("Não foi possível gerar o QR code.");
      setStatusType('error');
      
      toast({
        title: "Erro",
        description: "Não foi possível gerar o QR code para sincronização.",
        variant: "destructive"
      });
    }
  };

  useEffect(() => {
    if (salesRepId) {
      loadSyncLogs();
    }
  }, [salesRepId]);

  const getStatusIcon = (eventType: 'upload' | 'download' | 'error') => {
    switch (eventType) {
      case 'upload':
        return <CheckCircle className="text-green-500 h-5 w-5" />;
      case 'download':
        return <CheckCircle className="text-blue-500 h-5 w-5" />;
      case 'error':
        return <AlertCircle className="text-red-500 h-5 w-5" />;
      default:
        return null;
    }
  };

  // Ensure created_at is properly formatted when passing to formatDate
  const formatSyncDate = (dateValue: string | Date): string => {
    return formatDate(dateValue);
  };

  return (
    <div className="p-6 bg-white">
      {statusMessage && (
        <Alert className={`mb-6 ${statusType === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
          <AlertDescription>{statusMessage}</AlertDescription>
        </Alert>
      )}

      <div className="mb-6 p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-blue-800">Último sincronizado:</span>
          <span className="text-blue-700">{lastSynced || 'Nunca'}</span>
        </div>
        
        <div className="flex justify-end mt-4">
          <Button 
            variant="outline" 
            onClick={() => loadSyncLogs()}
            disabled={isLoading}
            className="mr-2 border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button onClick={generateQRCode} className="bg-blue-600 hover:bg-blue-700">
            <QrCode className="mr-2 h-4 w-4" />
            Gerar QR Code
          </Button>
        </div>
      </div>

      <h3 className="text-lg font-medium mb-4 text-blue-800">Histórico de Sincronização</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
        </div>
      ) : syncLogs.length > 0 ? (
        <div className="rounded-lg border border-blue-100 overflow-hidden">
          <Table>
            <TableHeader className="bg-blue-50">
              <TableRow>
                <TableHead className="text-blue-800">Status</TableHead>
                <TableHead className="text-blue-800">Tipo</TableHead>
                <TableHead className="text-blue-800">Dispositivo</TableHead>
                <TableHead className="text-blue-800">Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {syncLogs.map((log) => (
                <TableRow key={log.id} className="border-blue-100">
                  <TableCell>{getStatusIcon(log.event_type)}</TableCell>
                  <TableCell>
                    {log.event_type === 'upload' ? 'Envio' : 
                     log.event_type === 'download' ? 'Recebimento' : 'Erro'}
                  </TableCell>
                  <TableCell>{log.device_id}</TableCell>
                  <TableCell>{formatSyncDate(log.created_at)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          <Smartphone className="h-10 w-10 mx-auto mb-3 text-blue-400 opacity-70" />
          <p>Nenhum registro de sincronização encontrado</p>
          <p className="text-sm mt-2">Quando um dispositivo móvel sincronizar dados, o histórico aparecerá aqui.</p>
        </div>
      )}
      
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Sincronização Mobile</DialogTitle>
            <DialogDescription>
              Escaneie este QR code no aplicativo móvel para conectar e sincronizar dados.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-6">
            <QRCodeDisplay value={connectionData} />
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-2">
            <p>Este QR code é válido por 10 minutos.</p>
            <p>Após escaneá-lo, o aplicativo irá solicitar sua confirmação.</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MobileSyncPanel;
