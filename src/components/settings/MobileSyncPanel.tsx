
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
import { Loader2, RefreshCw, Smartphone, CheckCircle, AlertCircle, Trash2 } from "lucide-react";
import { mobileSyncService, SyncLogEntry } from '@/services/supabase/mobileSyncService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDate } from '@/utils/date-format';
import { toast } from '@/components/ui/use-toast';

interface MobileSyncPanelProps {
  salesRepId: string;
}

const MobileSyncPanel: React.FC<MobileSyncPanelProps> = ({ salesRepId }) => {
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isClearing, setIsClearing] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [statusType, setStatusType] = useState<'error' | 'info'>('info');

  // Clear status message after 5 seconds
  useEffect(() => {
    if (statusMessage) {
      const timer = setTimeout(() => setStatusMessage(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [statusMessage]);

  const loadSyncLogs = async () => {
    setIsLoading(true);
    try {
      const data = await mobileSyncService.getSyncLogs();
      
      setSyncLogs(data);
      
      if (data && data.length > 0) {
        setLastSynced(new Date(data[0].created_at).toLocaleString());
      }
      
      if (!data.length) {
        setStatusMessage("Nenhum histórico de sincronização encontrado.");
        setStatusType('info');
      }
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

  const clearSyncLogs = async () => {
    setIsClearing(true);
    try {
      await mobileSyncService.clearSyncLogs();
      setSyncLogs([]);
      setLastSynced(null);
      setStatusMessage("Histórico de sincronização limpo com sucesso.");
      setStatusType('info');
      
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

  useEffect(() => {
    loadSyncLogs();
  }, []);

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

      <div className="mb-4 sm:mb-6 p-3 sm:p-4 bg-gradient-to-r from-blue-50 to-green-50 rounded-lg border border-blue-100">
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
            variant="outline"
            onClick={clearSyncLogs}
            disabled={isLoading || isClearing || syncLogs.length === 0}
            className="border-blue-200 text-blue-700 hover:bg-blue-100 text-sm w-full sm:w-auto"
            size="sm"
          >
            <Trash2 className={`mr-2 h-3 w-3 sm:h-4 sm:w-4 ${isClearing ? 'animate-spin' : ''}`} />
            Limpar Histórico
          </Button>
        </div>
        
        <div className="mt-3 pt-2 border-t border-blue-200 text-xs text-blue-600">
          <div className="bg-blue-100 p-2 rounded text-center">
            <p><strong>Sistema de Sincronização Mobile</strong></p>
            <p>📱 Recebe dados diretamente de dispositivos móveis</p>
            <p className="text-xs mt-1">Configure o app móvel com URL: https://ufvnubabpcyimahbubkd.supabase.co</p>
          </div>
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
                  <TableHead className="text-blue-800 text-xs sm:text-sm">Dados</TableHead>
                  <TableHead className="text-blue-800 text-xs sm:text-sm">Qtd</TableHead>
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
                    <TableCell className="text-xs sm:text-sm py-2">{log.data_type || '—'}</TableCell>
                    <TableCell className="text-xs sm:text-sm py-2">{log.records_count || 0}</TableCell>
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
    </div>
  );
};

export default MobileSyncPanel;
