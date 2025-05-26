
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
import { Loader2, RefreshCw, Smartphone, CheckCircle, AlertCircle, QrCode, Wifi, Copy } from "lucide-react";
import { mobileSyncService, SyncLogEntry, ConnectionData } from '@/services/supabase/mobileSyncService';
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
  const [connectionData, setConnectionData] = useState<any | null>(null);

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

  const generateQRCode = async () => {
    try {
      console.log('📱 Generating optimized mobile API QR Code...');
      
      const connData = await mobileSyncService.generateConnectionData(salesRepId);
      const apiDiscoveryData = await mobileSyncService.createMobileApiDiscovery(connData);
      
      // Parse to validate the data
      const parsedData = JSON.parse(apiDiscoveryData);
      console.log('📱 QR Code data validated:', parsedData);
      
      setConnectionData(parsedData);
      setIsQrDialogOpen(true);
      
      toast({
        title: "QR Code otimizado gerado",
        description: `QR Code criado com ${apiDiscoveryData.length} caracteres para melhor escaneabilidade.`
      });
      
    } catch (error) {
      console.error("Error generating mobile API QR code:", error);
      setStatusMessage("Não foi possível gerar o QR code da API móvel.");
      setStatusType('error');
      
      toast({
        title: "Erro",
        description: "Não foi possível gerar o QR code para a API de sincronização.",
        variant: "destructive"
      });
    }
  };

  const copyConnectionInfo = () => {
    if (connectionData) {
      const info = `=== API MÓVEL - INFORMAÇÕES DE CONEXÃO ===\n\n` +
                  `Servidor: ${connectionData.serverUrl}\n` +
                  `IP Local: ${connectionData.localIp || 'N/A'}\n` +
                  `IP Público: ${connectionData.serverIp || 'N/A'}\n` +
                  `Token: ${connectionData.token}\n` +
                  `Vendedor ID: ${connectionData.salesRepId}\n\n` +
                  `Endpoints:\n` +
                  `- Download: ${connectionData.endpoints?.download}\n` +
                  `- Upload: ${connectionData.endpoints?.upload}\n` +
                  `- Status: ${connectionData.endpoints?.status}`;
      
      navigator.clipboard.writeText(info);
      toast({
        title: "Copiado!",
        description: "Informações da API móvel copiadas para a área de transferência."
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
        return <CheckCircle className="text-green-500 h-4 w-4 sm:h-5 sm:w-5" />;
      case 'download':
        return <CheckCircle className="text-blue-500 h-4 w-4 sm:h-5 sm:w-5" />;
      case 'error':
        return <AlertCircle className="text-red-500 h-4 w-4 sm:h-5 sm:w-5" />;
      default:
        return null;
    }
  };

  const formatSyncDate = (dateValue: string | Date): string => {
    return formatDate(dateValue);
  };

  return (
    <div className="p-3 sm:p-6 bg-white">
      {statusMessage && (
        <Alert className={`mb-4 sm:mb-6 ${statusType === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
          <AlertDescription className="text-sm">{statusMessage}</AlertDescription>
        </Alert>
      )}

      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center mb-2">
          <span className="font-medium text-blue-800 text-sm sm:text-base">Último sincronizado:</span>
          <span className="text-blue-700 text-xs sm:text-sm break-all">{lastSynced || 'Nunca'}</span>
        </div>
        
        <div className="flex flex-col sm:flex-row justify-end mt-3 sm:mt-4 space-y-2 sm:space-y-0 sm:space-x-2">
          <Button 
            variant="outline" 
            onClick={() => loadSyncLogs()}
            disabled={isLoading}
            className="border-blue-200 text-blue-700 hover:bg-blue-100 text-sm w-full sm:w-auto"
            size="sm"
          >
            <RefreshCw className={`mr-2 h-3 w-3 sm:h-4 sm:w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button 
            onClick={generateQRCode} 
            className="bg-blue-600 hover:bg-blue-700 text-sm w-full sm:w-auto"
            size="sm"
          >
            <Wifi className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
            Gerar API Móvel
          </Button>
        </div>
      </div>

      <h3 className="text-base sm:text-lg font-medium mb-3 sm:mb-4 text-blue-800">Histórico de Sincronização</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-6">
          <Loader2 className="h-5 w-5 sm:h-6 sm:w-6 animate-spin text-blue-600" />
        </div>
      ) : syncLogs.length > 0 ? (
        <div className="rounded-lg border border-blue-100 overflow-hidden">
          <div className="overflow-x-auto">
            <Table>
              <TableHeader className="bg-blue-50">
                <TableRow>
                  <TableHead className="text-blue-800 text-xs sm:text-sm">Status</TableHead>
                  <TableHead className="text-blue-800 text-xs sm:text-sm">Tipo</TableHead>
                  <TableHead className="text-blue-800 text-xs sm:text-sm">Dispositivo</TableHead>
                  <TableHead className="text-blue-800 text-xs sm:text-sm hidden sm:table-cell">IP</TableHead>
                  <TableHead className="text-blue-800 text-xs sm:text-sm">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncLogs.map((log) => (
                  <TableRow key={log.id} className="border-blue-100">
                    <TableCell className="py-2">{getStatusIcon(log.event_type)}</TableCell>
                    <TableCell className="text-xs sm:text-sm py-2">
                      {log.event_type === 'upload' ? 'Envio' : 
                       log.event_type === 'download' ? 'Recebimento' : 'Erro'}
                    </TableCell>
                    <TableCell className="text-xs sm:text-sm py-2 break-all max-w-[100px] sm:max-w-none">{log.device_id}</TableCell>
                    <TableCell className="text-xs sm:text-sm py-2 hidden sm:table-cell">{log.device_ip || '—'}</TableCell>
                    <TableCell className="text-xs sm:text-sm py-2">{formatSyncDate(log.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      ) : (
        <div className="text-center py-6 sm:py-8 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          <Smartphone className="h-8 w-8 sm:h-10 sm:w-10 mx-auto mb-3 text-blue-400 opacity-70" />
          <p className="text-sm sm:text-base">Nenhum registro de sincronização encontrado</p>
          <p className="text-xs sm:text-sm mt-2">Quando um dispositivo móvel sincronizar dados, o histórico aparecerá aqui.</p>
        </div>
      )}
      
      <Dialog open={isQrDialogOpen} onOpenChange={setIsQrDialogOpen}>
        <DialogContent className="sm:max-w-md w-[95vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader className="space-y-2">
            <DialogTitle className="flex items-center gap-2 text-base sm:text-lg">
              <Wifi className="h-4 w-4 sm:h-5 sm:w-5" />
              API Móvel - QR Code Otimizado
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              QR Code otimizado para melhor escaneabilidade. Configure o aplicativo móvel escaneando este código.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-2 sm:py-4">
            {connectionData && (
              <QRCodeDisplay 
                value={JSON.stringify(connectionData)} 
                showConnectionInfo={true}
                size={280}
              />
            )}
          </div>
          
          <div className="flex justify-center">
            <Button 
              variant="outline" 
              onClick={copyConnectionInfo} 
              disabled={!connectionData}
              className="text-xs sm:text-sm w-full sm:w-auto"
              size="sm"
            >
              <Copy className="mr-2 h-3 w-3 sm:h-4 sm:w-4" />
              Copiar Info da API
            </Button>
          </div>
          
          <div className="text-center text-xs text-gray-500 mt-2 space-y-1">
            <p>📱 QR Code otimizado para apps móveis</p>
            <p>🔑 Token válido por 10 minutos</p>
            <p>📊 Dados simplificados para melhor leitura</p>
            <p>🎯 Tamanho otimizado para escaneabilidade</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MobileSyncPanel;
