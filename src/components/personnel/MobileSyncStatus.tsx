import React, { useState, useEffect } from 'react';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { 
  Loader2, 
  RefreshCw, 
  Smartphone, 
  CheckCircle, 
  AlertCircle, 
  Info, 
  Trash2,
  QrCode 
} from "lucide-react";
import { mobileSyncService, SyncLogEntry } from '@/services/firebase/mobileSyncService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { toast } from '@/components/ui/use-toast';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import QRCodeDisplay from '../settings/QRCodeDisplay';

interface MobileSyncStatusProps {
  salesRepId: string;
}

const MobileSyncStatus: React.FC<MobileSyncStatusProps> = ({ salesRepId }) => {
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'error' | 'success' | 'info' | 'warning'>('info');
  const [connectionError, setConnectionError] = useState<boolean>(false);
  const [isClearing, setIsClearing] = useState<boolean>(false);
  const [isQrDialogOpen, setIsQrDialogOpen] = useState(false);
  const [connectionData, setConnectionData] = useState<string>('');

  // Clear status message after 5 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  // Filter function to remove temporary documents from results
  const filterTemporaryDocs = (logs: SyncLogEntry[]): SyncLogEntry[] => {
    if (!logs || !Array.isArray(logs)) return [];
    
    return logs.filter(log => {
      // Skip documents that are marked as temporary
      if (!log || typeof log !== 'object') return false;
      if (log._temp === true) return false;
      
      // Keep only documents with valid properties
      return log.id && log.event_type && log.created_at;
    });
  };

  const loadSyncLogs = async () => {
    if (!salesRepId) {
      console.error("MobileSyncStatus: No salesRepId provided");
      setStatusMessage("ID do representante de vendas não fornecido.");
      setStatusType('error');
      return;
    }
    
    setIsLoading(true);
    setConnectionError(false);
    
    try {
      console.log(`MobileSyncStatus: Loading sync logs for sales rep ID ${salesRepId}`);
      const data = await mobileSyncService.getSyncLogs(salesRepId);
      
      // Filter out temporary documents
      const filteredData = filterTemporaryDocs(data || []);
      setSyncLogs(filteredData);
      
      if (filteredData && filteredData.length > 0) {
        const dateObj = filteredData[0].created_at instanceof Date 
          ? filteredData[0].created_at 
          : new Date(filteredData[0].created_at);
        
        setLastSynced(dateObj.toLocaleString());
        setStatusMessage("Dados carregados com sucesso.");
        setStatusType('success');
      } else {
        console.log("MobileSyncStatus: No sync logs found for this sales rep");
        setStatusMessage("Nenhum histórico de sincronização encontrado.");
        setStatusType('info');
        setLastSynced(null);
      }
    } catch (error) {
      console.error("MobileSyncStatus: Error loading sync logs:", error);
      setStatusMessage("Não foi possível carregar os logs de sincronização. Verifique sua conexão.");
      setStatusType('error');
      setConnectionError(true);
      
      toast({
        title: "Erro de sincronização",
        description: "Não foi possível carregar os dados de sincronização. Verifique sua conexão com a internet.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const clearSyncLogs = async () => {
    if (!salesRepId) {
      setStatusMessage("ID do representante de vendas não fornecido.");
      setStatusType('error');
      return;
    }
    
    setIsClearing(true);
    
    try {
      await mobileSyncService.clearSyncLogs(salesRepId);
      setSyncLogs([]);
      setLastSynced(null);
      setStatusMessage("Histórico de sincronização limpo com sucesso.");
      setStatusType('success');
      
      toast({
        title: "Logs de sincronização",
        description: "Histórico de sincronização limpo com sucesso!",
      });
    } catch (error) {
      console.error("Error clearing sync logs:", error);
      setStatusMessage("Erro ao limpar histórico de sincronização.");
      setStatusType('error');
      
      toast({
        title: "Erro",
        description: "Não foi possível limpar o histórico de sincronização.",
        variant: "destructive"
      });
    } finally {
      setIsClearing(false);
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
    }
  };

  useEffect(() => {
    if (salesRepId) {
      loadSyncLogs();
    } else {
      console.warn("MobileSyncStatus: Component mounted without salesRepId");
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

  const getAlertStyles = () => {
    switch (statusType) {
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'success':
        return 'bg-green-50 border-green-200';
      case 'warning':
        return 'bg-yellow-50 border-yellow-200';
      case 'info':
      default:
        return 'bg-blue-50 border-blue-200';
    }
  };

  if (!salesRepId) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Status de Sincronização Mobile</CardTitle>
        </CardHeader>
        <CardContent>
          <Alert className="bg-yellow-50 border-yellow-200">
            <AlertDescription>
              <div className="flex items-center">
                <Info className="mr-2 h-5 w-5 text-yellow-500" />
                Selecione um representante de vendas para visualizar os dados de sincronização.
              </div>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-blue-100 shadow-sm">
      <CardHeader className="bg-blue-50 border-b border-blue-100">
        <CardTitle className="flex items-center text-blue-800">
          <Smartphone className="mr-2 text-blue-600" />
          Status de Sincronização Mobile
        </CardTitle>
        <CardDescription className="text-blue-700">
          Status e histórico de sincronização do aplicativo mobile
        </CardDescription>
      </CardHeader>
      <CardContent className="p-5">
        {statusMessage && (
          <Alert className={`mb-4 ${getAlertStyles()}`}>
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}

        <div className="mb-4 p-4 bg-blue-50 rounded-lg border border-blue-100">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium text-blue-800">Último sincronizado:</span>
            <span className="text-blue-700">{lastSynced || 'Nunca'}</span>
          </div>
        </div>

        <h3 className="text-lg font-medium mb-2 text-blue-800">Histórico de Sincronização</h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin text-blue-600" />
          </div>
        ) : connectionError ? (
          <div className="text-center py-4 text-red-500">
            <AlertCircle className="h-8 w-8 mx-auto mb-2" />
            Erro de conexão. Verifique sua internet e tente novamente.
          </div>
        ) : syncLogs && syncLogs.length > 0 ? (
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
                    <TableCell>{log.device_id || '—'}</TableCell>
                    <TableCell>
                      {log.created_at instanceof Date 
                        ? log.created_at.toLocaleString() 
                        : new Date(log.created_at).toLocaleString()}
                    </TableCell>
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
      </CardContent>
      <CardFooter className="flex justify-between border-t border-blue-100 p-4 bg-blue-50/50">
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            onClick={() => loadSyncLogs()}
            disabled={isLoading}
            className="border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            variant="outline"
            onClick={clearSyncLogs}
            disabled={isLoading || isClearing || syncLogs.length === 0}
            className="border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <Trash2 className={`mr-2 h-4 w-4 ${isClearing ? 'animate-spin' : ''}`} />
            Limpar Histórico
          </Button>
        </div>
        <Button onClick={generateQRCode} className="bg-blue-600 hover:bg-blue-700">
          <QrCode className="mr-2 h-4 w-4" />
          Gerar QR Code
        </Button>
      </CardFooter>
      
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
    </Card>
  );
};

export default MobileSyncStatus;
