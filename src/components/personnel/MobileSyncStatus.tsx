
import React, { useState } from 'react';
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
import { useToast } from "@/components/ui/use-toast";
import { Loader2, RefreshCw, Smartphone, CheckCircle, AlertCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

interface SyncLogEntry {
  id: string;
  event_type: string;
  device_id: string;
  sales_rep_id: string;
  created_at: string;
  details: any;
}

interface MobileSyncStatusProps {
  salesRepId: string;
}

const MobileSyncStatus: React.FC<MobileSyncStatusProps> = ({ salesRepId }) => {
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [lastSynced, setLastSynced] = useState<string | null>(null);
  const { toast } = useToast();

  const loadSyncLogs = async () => {
    if (!salesRepId) return;
    
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .eq('sales_rep_id', salesRepId)
        .order('created_at', { ascending: false })
        .limit(10);
        
      if (error) throw error;
      
      setSyncLogs(data || []);
      
      if (data && data.length > 0) {
        setLastSynced(new Date(data[0].created_at).toLocaleString());
      }
    } catch (error) {
      console.error("Error loading sync logs:", error);
      toast({
        title: "Erro ao carregar logs de sincronização",
        description: "Não foi possível carregar os logs de sincronização.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const generateQRCode = () => {
    // This would generate a QR code with connection information
    // For now we'll just show a toast
    toast({
      title: "QR Code para sincronização",
      description: "Funcionalidade será implementada em breve.",
      variant: "default"
    });
  };

  React.useEffect(() => {
    if (salesRepId) {
      loadSyncLogs();
    }
  }, [salesRepId]);

  const getStatusIcon = (eventType: string) => {
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
