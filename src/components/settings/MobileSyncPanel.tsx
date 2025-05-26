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
  const [connectionData, setConnectionData] = useState<ConnectionData | null>(null);

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
      console.log('📱 Generating mobile API QR Code...');
      
      // Generate connection data with API endpoints
      const connData = await mobileSyncService.generateConnectionData(salesRepId);
      
      // Create mobile API discovery data
      const apiDiscoveryData = await mobileSyncService.createMobileApiDiscovery(connData);
      setConnectionData(JSON.parse(apiDiscoveryData));
      
      setIsQrDialogOpen(true);
      
      toast({
        title: "QR Code da API Móvel gerado",
        description: "QR Code criado para sincronização de dados com o aplicativo móvel."
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
                  `Servidor: ${connectionData.server?.name || connectionData.serverUrl}\n` +
                  `URL Base: ${connectionData.server?.url || connectionData.serverUrl}\n` +
                  `IP Local: ${connectionData.server?.localIp || 'N/A'}\n` +
                  `IP Público: ${connectionData.server?.publicIp || 'N/A'}\n` +
                  `Porta: ${connectionData.server?.port || 'N/A'}\n\n` +
                  `=== AUTENTICAÇÃO ===\n` +
                  `Token: ${connectionData.authentication?.token || 'N/A'}\n` +
                  `Expira: ${connectionData.authentication?.expiresAt ? new Date(connectionData.authentication.expiresAt).toLocaleString() : 'N/A'}\n\n` +
                  `=== ENDPOINTS DA API ===\n` +
                  `Download: ${connectionData.api?.endpoints?.downloadData || 'N/A'}\n` +
                  `Upload: ${connectionData.api?.endpoints?.uploadData || 'N/A'}\n` +
                  `Status: ${connectionData.api?.endpoints?.checkStatus || 'N/A'}\n\n` +
                  `=== DADOS DISPONÍVEIS ===\n` +
                  `Download: ${connectionData.dataTypes?.download?.join(', ') || 'clientes, produtos, rotas'}\n` +
                  `Upload: ${connectionData.dataTypes?.upload?.join(', ') || 'atualizações'}`;
      
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
        
        <div className="flex justify-end mt-4 space-x-2">
          <Button 
            variant="outline" 
            onClick={() => loadSyncLogs()}
            disabled={isLoading}
            className="border-blue-200 text-blue-700 hover:bg-blue-100"
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button onClick={generateQRCode} className="bg-blue-600 hover:bg-blue-700">
            <Wifi className="mr-2 h-4 w-4" />
            Gerar API Móvel
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
                <TableHead className="text-blue-800">IP</TableHead>
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
                  <TableCell>{log.device_ip || '—'}</TableCell>
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
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Wifi className="h-5 w-5" />
              API Móvel - Sincronização de Dados
            </DialogTitle>
            <DialogDescription>
              Escaneie este QR code no aplicativo móvel para configurar a sincronização de clientes, produtos e rotas.
            </DialogDescription>
          </DialogHeader>
          
          <div className="flex justify-center py-4">
            {connectionData && (
              <QRCodeDisplay 
                value={JSON.stringify(connectionData)} 
                showConnectionInfo={true}
              />
            )}
          </div>
          
          <div className="flex justify-center space-x-2">
            <Button variant="outline" onClick={copyConnectionInfo} disabled={!connectionData}>
              <Copy className="mr-2 h-4 w-4" />
              Copiar Info da API
            </Button>
          </div>
          
          <div className="text-center text-sm text-gray-500 mt-2">
            <p>📱 Use para conectar o app móvel que terá clientes, produtos e rotas</p>
            <p>🔑 Token válido por 10 minutos</p>
            <p>📊 Permite download e upload de dados</p>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default MobileSyncPanel;
