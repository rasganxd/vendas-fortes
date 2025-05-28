
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
import { Loader2, RefreshCw, CheckCircle, AlertCircle, Trash2, Download } from "lucide-react";
import { mobileSyncService, SyncLogEntry } from '@/services/supabase/mobileSyncService';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDate } from '@/utils/date-format';
import { toast } from '@/components/ui/use-toast';
import { CustomScrollArea } from '@/components/ui/custom-scroll-area';

interface CompactMobileSyncPanelProps {
  salesRepId: string;
}

const CompactMobileSyncPanel: React.FC<CompactMobileSyncPanelProps> = ({ salesRepId }) => {
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
        return <CheckCircle className="text-green-500 h-4 w-4" />;
      case 'download':
        return <CheckCircle className="text-blue-500 h-4 w-4" />;
      case 'error':
        return <AlertCircle className="text-red-500 h-4 w-4" />;
      default:
        return null;
    }
  };

  const formatSyncDate = (dateValue: string | Date): string => {
    return formatDate(dateValue);
  };

  return (
    <div className="p-4 bg-white">
      {statusMessage && (
        <Alert className={`mb-3 ${statusType === 'error' ? 'bg-red-50 border-red-200 text-red-800' : 'bg-blue-50 border-blue-200 text-blue-800'}`}>
          <AlertDescription className="text-sm">{statusMessage}</AlertDescription>
        </Alert>
      )}

      <div className="mb-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
        <div className="flex justify-between items-center mb-2">
          <span className="font-medium text-blue-800 text-sm">Último sincronizado:</span>
          <span className="text-blue-700 text-xs">{lastSynced || 'Nunca'}</span>
        </div>
        
        <div className="flex flex-wrap gap-2 mt-3">
          <Button 
            variant="outline" 
            onClick={() => loadSyncLogs()}
            disabled={isLoading}
            className="border-blue-200 text-blue-700 hover:bg-blue-100 text-xs h-8"
            size="sm"
          >
            <RefreshCw className={`mr-1 h-3 w-3 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          
          <Button
            variant="outline"
            onClick={clearSyncLogs}
            disabled={isLoading || isClearing || syncLogs.length === 0}
            className="border-blue-200 text-blue-700 hover:bg-blue-100 text-xs h-8"
            size="sm"
          >
            <Trash2 className={`mr-1 h-3 w-3 ${isClearing ? 'animate-spin' : ''}`} />
            Limpar
          </Button>
        </div>
        
        <div className="mt-3 pt-2 border-t border-blue-200 text-xs text-blue-600">
          <div className="bg-blue-100 p-2 rounded text-center">
            <p><strong>API Móvel:</strong></p>
            <p className="text-xs break-all">URL: https://ufvnubabpcyimahbubkd.supabase.co</p>
            <p className="text-xs">Configure o app móvel para sincronização direta</p>
          </div>
        </div>
      </div>

      <h3 className="text-sm font-medium mb-2 text-blue-800">Histórico de Sincronização</h3>
      
      {isLoading ? (
        <div className="flex items-center justify-center py-4">
          <Loader2 className="h-5 w-5 animate-spin text-blue-600" />
        </div>
      ) : syncLogs.length > 0 ? (
        <div className="rounded-lg border border-blue-100 overflow-hidden">
          <CustomScrollArea maxHeight="200px">
            <Table>
              <TableHeader className="bg-blue-50">
                <TableRow>
                  <TableHead className="text-blue-800 text-xs h-8">Status</TableHead>
                  <TableHead className="text-blue-800 text-xs h-8">Tipo</TableHead>
                  <TableHead className="text-blue-800 text-xs h-8">Dados</TableHead>
                  <TableHead className="text-blue-800 text-xs h-8">Qtd</TableHead>
                  <TableHead className="text-blue-800 text-xs h-8">Data</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {syncLogs.map((log) => (
                  <TableRow key={log.id} className="border-blue-100">
                    <TableCell className="py-1 h-8">{getStatusIcon(log.event_type)}</TableCell>
                    <TableCell className="text-xs py-1 h-8">
                      {log.event_type === 'upload' ? 'Envio' : 
                       log.event_type === 'download' ? 'Recebimento' : 'Erro'}
                    </TableCell>
                    <TableCell className="text-xs py-1 h-8">{log.data_type || '—'}</TableCell>
                    <TableCell className="text-xs py-1 h-8">{log.records_count || 0}</TableCell>
                    <TableCell className="text-xs py-1 h-8">{formatSyncDate(log.created_at)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CustomScrollArea>
        </div>
      ) : (
        <div className="text-center py-6 text-gray-500 bg-gray-50 rounded-lg border border-gray-200">
          <p className="text-sm">Nenhum registro de sincronização encontrado</p>
          <p className="text-xs mt-1">Quando um dispositivo móvel sincronizar dados, o histórico aparecerá aqui.</p>
        </div>
      )}
    </div>
  );
};

export default CompactMobileSyncPanel;
