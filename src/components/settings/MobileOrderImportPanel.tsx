
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Clock,
  Smartphone,
  Trash2
} from 'lucide-react';
import { toast } from 'sonner';
import { mobileOrderImportService, ImportLog } from '@/services/supabase/mobileOrderImportService';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface ImportStats {
  totalImported: number;
  todayImported: number;
  failedImports: number;
  lastImport: Date | undefined;
}

export default function MobileOrderImportPanel() {
  const [stats, setStats] = useState<ImportStats>({
    totalImported: 0,
    todayImported: 0,
    failedImports: 0,
    lastImport: undefined
  });
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  const loadStats = async () => {
    try {
      setIsLoading(true);
      const importStats = await mobileOrderImportService.getImportStats();
      setStats(importStats);
    } catch (error) {
      console.error('Erro ao carregar estatísticas:', error);
      toast('Erro ao carregar estatísticas', {
        description: 'Não foi possível carregar as estatísticas de importação'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadLogs = async () => {
    try {
      setIsLoadingLogs(true);
      const importLogs = await mobileOrderImportService.getImportLogs(20);
      setLogs(importLogs);
    } catch (error) {
      console.error('Erro ao carregar logs:', error);
      toast('Erro ao carregar logs', {
        description: 'Não foi possível carregar os logs de importação'
      });
    } finally {
      setIsLoadingLogs(false);
    }
  };

  const clearLogs = async () => {
    try {
      setIsLoading(true);
      await mobileOrderImportService.clearImportLogs();
      setLogs([]);
      toast('Logs limpos', {
        description: 'Todos os logs de importação foram removidos'
      });
    } catch (error) {
      console.error('Erro ao limpar logs:', error);
      toast('Erro ao limpar logs', {
        description: 'Não foi possível limpar os logs'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshData = async () => {
    await Promise.all([loadStats(), loadLogs()]);
  };

  useEffect(() => {
    refreshData();
  }, []);

  const getStatusBadge = (status: string, eventType: string) => {
    if (status === 'completed') {
      return <Badge variant="secondary" className="bg-green-100 text-green-800">Concluído</Badge>;
    }
    if (status === 'failed') {
      return <Badge variant="destructive">Falhou</Badge>;
    }
    if (eventType === 'error') {
      return <Badge variant="destructive">Erro</Badge>;
    }
    return <Badge variant="outline">{status}</Badge>;
  };

  const getEventIcon = (eventType: string) => {
    switch (eventType) {
      case 'upload':
        return <Upload size={16} className="text-blue-600" />;
      case 'download':
        return <Download size={16} className="text-green-600" />;
      case 'error':
        return <AlertCircle size={16} className="text-red-600" />;
      default:
        return <Clock size={16} className="text-gray-600" />;
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2">
              <Smartphone size={20} />
              Importação de Pedidos Mobile
            </CardTitle>
            <Button 
              variant="outline" 
              size="sm" 
              onClick={refreshData}
              disabled={isLoading}
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Atualizar
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Estatísticas */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="text-center p-4 bg-blue-50 rounded-lg">
              <div className="text-2xl font-bold text-blue-600">{stats.totalImported}</div>
              <div className="text-sm text-gray-600">Total Importado</div>
            </div>
            <div className="text-center p-4 bg-green-50 rounded-lg">
              <div className="text-2xl font-bold text-green-600">{stats.todayImported}</div>
              <div className="text-sm text-gray-600">Hoje</div>
            </div>
            <div className="text-center p-4 bg-red-50 rounded-lg">
              <div className="text-2xl font-bold text-red-600">{stats.failedImports}</div>
              <div className="text-sm text-gray-600">Falharam</div>
            </div>
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-sm font-medium text-gray-600">Última Importação</div>
              <div className="text-sm text-gray-500">
                {stats.lastImport 
                  ? formatDistanceToNow(stats.lastImport, { addSuffix: true, locale: ptBR })
                  : 'Nunca'
                }
              </div>
            </div>
          </div>

          <Separator />

          {/* Logs de Importação */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold">Histórico de Importações</h3>
              <div className="flex gap-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={loadLogs}
                  disabled={isLoadingLogs}
                >
                  <RefreshCw size={16} className={isLoadingLogs ? 'animate-spin' : ''} />
                  Recarregar
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={clearLogs}
                  disabled={isLoading || logs.length === 0}
                >
                  <Trash2 size={16} />
                  Limpar Logs
                </Button>
              </div>
            </div>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {logs.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum log de importação encontrado
                </div>
              ) : (
                logs.map((log) => (
                  <div key={log.id} className="p-3 border rounded-lg bg-white">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {getEventIcon(log.event_type)}
                        <div>
                          <div className="font-medium capitalize">
                            {log.event_type === 'upload' ? 'Upload' : 
                             log.event_type === 'download' ? 'Download' : 'Erro'}
                          </div>
                          <div className="text-sm text-gray-500">
                            {log.records_count} registro(s)
                            {log.sales_rep_id && ` • Vendedor: ${log.sales_rep_id}`}
                          </div>
                        </div>
                      </div>
                      <div className="text-right">
                        {getStatusBadge(log.status, log.event_type)}
                        <div className="text-xs text-gray-500 mt-1">
                          {formatDistanceToNow(new Date(log.created_at), { addSuffix: true, locale: ptBR })}
                        </div>
                      </div>
                    </div>
                    
                    {log.error_message && (
                      <div className="mt-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                        <strong>Erro:</strong> {log.error_message}
                      </div>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
