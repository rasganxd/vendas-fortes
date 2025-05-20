
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
import { Loader2, RefreshCw, Smartphone, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { SyncLogEntry, syncService } from "@/services/supabase/syncService";
import { Alert, AlertDescription } from '@/components/ui/alert';

interface MobileSyncStatusProps {
  salesRepId: string;
}

const MobileSyncStatus: React.FC<MobileSyncStatusProps> = ({ salesRepId }) => {
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
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
    if (!salesRepId) return;
    
    setIsLoading(true);
    try {
      const data = await syncService.getSyncLogs(salesRepId);
      
      setSyncLogs(data);
      
      if (data && data.length > 0) {
        setLastSynced(new Date(data[0].created_at).toLocaleString());
      }
    } catch (error) {
      console.error("Error loading sync logs:", error);
      setStatusMessage("Não foi possível carregar os logs de sincronização.");
      setStatusType('error');
      
      // Método alternativo caso o RPC falhe
      try {
        const { data: fallbackData, error: fallbackError } = await supabase
          .from('sync_logs')
          .select('*')
          .eq('sales_rep_id', salesRepId)
          .order('created_at', { ascending: false })
          .limit(10);
          
        if (fallbackError) throw fallbackError;
        
        // Transform the data to match the SyncLogEntry type
        const typedData: SyncLogEntry[] = fallbackData ? fallbackData.map((log: any) => ({
          id: log.id,
          event_type: log.event_type as 'upload' | 'download' | 'error', 
          device_id: log.device_id,
          sales_rep_id: log.sales_rep_id,
          created_at: log.created_at,
          details: log.details
        })) : [];
        
        setSyncLogs(typedData);
        
        if (typedData && typedData.length > 0) {
          setLastSynced(new Date(typedData[0].created_at).toLocaleString());
          setStatusMessage(null); // Clear error if fallback succeeds
        }
      } catch (fallbackError) {
        console.error("Fallback method also failed:", fallbackError);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = () => {
    // This would generate a QR code with connection information
    setStatusMessage("Funcionalidade será implementada em breve.");
    setStatusType('info');
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

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center">
          <Smartphone className="mr-2" />
          Status de Sincronização Mobile
        </CardTitle>
        <CardDescription>
          Status e histórico de sincronização do aplicativo mobile
        </CardDescription>
      </CardHeader>
      <CardContent>
        {statusMessage && (
          <Alert className={`mb-4 ${statusType === 'error' ? 'bg-red-50 border-red-200' : 'bg-blue-50 border-blue-200'}`}>
            <AlertDescription>{statusMessage}</AlertDescription>
          </Alert>
        )}

        <div className="mb-4">
          <div className="flex justify-between items-center mb-2">
            <span className="font-medium">Último sincronizado:</span>
            <span>{lastSynced || 'Nunca'}</span>
          </div>
        </div>

        <h3 className="text-lg font-medium mb-2">Histórico de Sincronização</h3>
        
        {isLoading ? (
          <div className="flex items-center justify-center py-4">
            <Loader2 className="h-6 w-6 animate-spin" />
          </div>
        ) : syncLogs.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Dispositivo</TableHead>
                <TableHead>Data</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {syncLogs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell>{getStatusIcon(log.event_type)}</TableCell>
                  <TableCell>
                    {log.event_type === 'upload' ? 'Envio' : 
                     log.event_type === 'download' ? 'Recebimento' : 'Erro'}
                  </TableCell>
                  <TableCell>{log.device_id}</TableCell>
                  <TableCell>{new Date(log.created_at).toLocaleString()}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <div className="text-center py-4 text-gray-500">
            Nenhum registro de sincronização encontrado
          </div>
        )}
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button 
          variant="outline" 
          onClick={() => loadSyncLogs()}
          disabled={isLoading}
        >
          <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
          Atualizar
        </Button>
        <Button onClick={generateQRCode}>
          Gerar QR Code para Sincronização
        </Button>
      </CardFooter>
    </Card>
  );
};

export default MobileSyncStatus;
