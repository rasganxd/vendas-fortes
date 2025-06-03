
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  Smartphone, 
  RefreshCw, 
  Users, 
  ShoppingCart, 
  CheckCircle, 
  Download,
  Upload,
  Activity,
  AlertCircle
} from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { LoadingSpinner } from "@/components/ui/loading-spinner";
import { toast } from "sonner";
import LocalSyncServerPanel from './LocalSyncServerPanel';
import SalesRepSyncStatus from './SalesRepSyncStatus';

interface SyncStatistic {
  sales_rep_id: string;
  sales_rep_name: string;
  pending_orders: number;
  last_sync: string | null;
  total_orders: number;
}

interface SyncLog {
  id: string;
  sales_rep_id?: string;
  event_type: 'upload' | 'download' | 'error';
  data_type?: string;
  records_count?: number;
  status: string;
  error_message?: string;
  created_at: string;
  metadata?: any;
}

const MobileSyncDashboard: React.FC = () => {
  const [statistics, setStatistics] = useState<SyncStatistic[]>([]);
  const [syncLogs, setSyncLogs] = useState<SyncLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isImporting, setIsImporting] = useState(false);

  const loadStatistics = async () => {
    try {
      console.log('📊 Loading sync statistics...');
      
      const { data, error } = await supabase.rpc('get_sync_statistics');
      
      if (error) {
        console.error('❌ Error loading statistics:', error);
        throw error;
      }

      setStatistics(data || []);
      console.log('✅ Statistics loaded:', data?.length || 0);
    } catch (error) {
      console.error('❌ Failed to load statistics:', error);
      toast.error('Erro ao carregar estatísticas de sincronização');
    }
  };

  const loadSyncLogs = async () => {
    try {
      console.log('📋 Loading sync logs...');
      
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Error loading sync logs:', error);
        throw error;
      }

      // Transform and validate data with proper type casting
      const transformedLogs: SyncLog[] = (data || []).map(log => ({
        id: log.id,
        sales_rep_id: log.sales_rep_id,
        event_type: log.event_type as 'upload' | 'download' | 'error',
        data_type: log.data_type,
        records_count: log.records_count,
        status: log.status,
        error_message: log.error_message,
        created_at: log.created_at,
        metadata: log.metadata
      }));

      setSyncLogs(transformedLogs);
      console.log('✅ Sync logs loaded:', transformedLogs.length);
    } catch (error) {
      console.error('❌ Failed to load sync logs:', error);
      toast.error('Erro ao carregar logs de sincronização');
    }
  };

  const loadData = async () => {
    setIsLoading(true);
    try {
      await Promise.all([loadStatistics(), loadSyncLogs()]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadData();

    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadData, 30000);

    // Escutar mudanças em tempo real
    const channel = supabase
      .channel('sync-updates')
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'sync_logs' },
        () => {
          console.log('🔄 Sync logs updated, reloading...');
          loadData();
        }
      )
      .on('postgres_changes', 
        { event: '*', schema: 'public', table: 'orders_mobile' },
        () => {
          console.log('🔄 Mobile orders updated, reloading...');
          loadData();
        }
      )
      .subscribe();

    return () => {
      clearInterval(interval);
      supabase.removeChannel(channel);
    };
  }, []);

  const handleImportAll = async () => {
    setIsImporting(true);
    try {
      console.log('📥 Starting import of all mobile orders...');
      
      const { data, error } = await supabase.rpc('import_mobile_orders_enhanced', {
        p_sales_rep_id: null, // Import from all sales reps
        p_imported_by: 'desktop_dashboard'
      });

      if (error) {
        console.error('❌ Error importing orders:', error);
        throw error;
      }

      const result = data[0] || { imported_count: 0, failed_count: 0, error_messages: [] };
      
      console.log('✅ Import completed:', result);
      
      if (result.imported_count > 0) {
        toast.success(`${result.imported_count} pedidos importados com sucesso!`);
      }
      
      if (result.failed_count > 0) {
        toast.error(`${result.failed_count} pedidos falharam na importação`);
      }

      if (result.imported_count === 0 && result.failed_count === 0) {
        toast.info('Nenhum pedido pendente para importar');
      }

      // Recarregar dados
      await loadData();

    } catch (error) {
      console.error('❌ Failed to import orders:', error);
      toast.error('Erro ao importar pedidos mobile');
    } finally {
      setIsImporting(false);
    }
  };

  const handleImportBySalesRep = async (salesRepId: string, salesRepName: string) => {
    setIsImporting(true);
    try {
      console.log(`📥 Starting import for sales rep: ${salesRepName}`);
      
      const { data, error } = await supabase.rpc('import_mobile_orders_enhanced', {
        p_sales_rep_id: salesRepId,
        p_imported_by: 'desktop_dashboard'
      });

      if (error) {
        console.error('❌ Error importing orders:', error);
        throw error;
      }

      const result = data[0] || { imported_count: 0, failed_count: 0, error_messages: [] };
      
      console.log('✅ Import completed:', result);
      
      if (result.imported_count > 0) {
        toast.success(`${result.imported_count} pedidos de ${salesRepName} importados!`);
      } else {
        toast.info(`Nenhum pedido pendente para ${salesRepName}`);
      }

      // Recarregar dados
      await loadData();

    } catch (error) {
      console.error('❌ Failed to import orders:', error);
      toast.error(`Erro ao importar pedidos de ${salesRepName}`);
    } finally {
      setIsImporting(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('pt-BR');
  };

  const getEventTypeIcon = (eventType: string) => {
    switch (eventType) {
      case 'upload': return <Upload className="h-4 w-4 text-blue-500" />;
      case 'download': return <Download className="h-4 w-4 text-green-500" />;
      case 'error': return <AlertCircle className="h-4 w-4 text-red-500" />;
      default: return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const totalPendingOrders = statistics.reduce((sum, stat) => sum + stat.pending_orders, 0);
  const activeSalesReps = statistics.filter(stat => stat.total_orders > 0).length;

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <LoadingSpinner size="lg" className="mr-2" />
          <span>Carregando dashboard de sincronização...</span>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="space-y-6">
      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <ShoppingCart className="h-5 w-5 text-orange-500" />
              <div>
                <p className="text-sm text-muted-foreground">Pedidos Pendentes</p>
                <p className="text-2xl font-bold text-orange-600">{totalPendingOrders}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Users className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-sm text-muted-foreground">Vendedores Ativos</p>
                <p className="text-2xl font-bold text-blue-600">{activeSalesReps}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Smartphone className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-sm text-muted-foreground">Conexões Mobile</p>
                <p className="text-2xl font-bold text-green-600">
                  {statistics.filter(stat => stat.last_sync).length}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <RefreshCw className="h-5 w-5 text-purple-500" />
              <div>
                <p className="text-sm text-muted-foreground">Logs Recentes</p>
                <p className="text-2xl font-bold text-purple-600">{syncLogs.length}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Servidor Local */}
      <LocalSyncServerPanel />

      {/* Status dos Vendedores */}
      <SalesRepSyncStatus />

      {/* Ações de Importação */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Importação de Pedidos Mobile</span>
            <Button 
              onClick={handleImportAll}
              disabled={isImporting || totalPendingOrders === 0}
              className="ml-4"
            >
              {isImporting ? (
                <>
                  <LoadingSpinner size="sm" className="mr-2" />
                  Importando...
                </>
              ) : (
                <>
                  <Download className="mr-2 h-4 w-4" />
                  Importar Todos ({totalPendingOrders})
                </>
              )}
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {totalPendingOrders === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              <CheckCircle className="h-12 w-12 mx-auto mb-4 text-green-500" />
              <p>Todos os pedidos mobile foram importados!</p>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground mb-4">
              Existem {totalPendingOrders} pedidos mobile pendentes de importação.
            </p>
          )}
        </CardContent>
      </Card>

      <Tabs defaultValue="statistics" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="statistics">Estatísticas por Vendedor</TabsTrigger>
          <TabsTrigger value="logs">Logs de Sincronização</TabsTrigger>
        </TabsList>

        <TabsContent value="statistics" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Status por Vendedor</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {statistics.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum vendedor com atividade mobile encontrado
                  </p>
                ) : (
                  statistics.map((stat) => (
                    <div key={stat.sales_rep_id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex-1">
                        <h4 className="font-medium">{stat.sales_rep_name}</h4>
                        <div className="flex items-center space-x-4 mt-1 text-sm text-muted-foreground">
                          <span>Pedidos pendentes: {stat.pending_orders}</span>
                          <span>Total: {stat.total_orders}</span>
                          {stat.last_sync && (
                            <span>Última sync: {formatDate(stat.last_sync)}</span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center space-x-2">
                        {stat.pending_orders > 0 && (
                          <Badge variant="destructive">{stat.pending_orders} pendentes</Badge>
                        )}
                        {stat.last_sync ? (
                          <Badge variant="default">Ativo</Badge>
                        ) : (
                          <Badge variant="outline">Sem sync</Badge>
                        )}
                        {stat.pending_orders > 0 && (
                          <Button 
                            size="sm" 
                            onClick={() => handleImportBySalesRep(stat.sales_rep_id, stat.sales_rep_name)}
                            disabled={isImporting}
                          >
                            {isImporting ? (
                              <LoadingSpinner size="sm" />
                            ) : (
                              <>
                                <Download className="mr-1 h-3 w-3" />
                                Importar ({stat.pending_orders})
                              </>
                            )}
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Logs de Sincronização</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {syncLogs.length === 0 ? (
                  <p className="text-center text-muted-foreground py-8">
                    Nenhum log de sincronização encontrado
                  </p>
                ) : (
                  syncLogs.map((log) => (
                    <div key={log.id} className="flex items-center space-x-3 p-3 border rounded-lg text-sm">
                      {getEventTypeIcon(log.event_type)}
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-medium">
                            {log.event_type === 'upload' ? 'Upload' : 
                             log.event_type === 'download' ? 'Download' : 'Erro'}
                          </span>
                          {log.data_type && <span>({log.data_type})</span>}
                          {log.records_count !== undefined && (
                            <span className="text-muted-foreground">
                              - {log.records_count} registros
                            </span>
                          )}
                        </div>
                        <div className="text-muted-foreground">
                          {formatDate(log.created_at)}
                          {log.error_message && (
                            <span className="text-red-500 ml-2">- {log.error_message}</span>
                          )}
                        </div>
                      </div>
                      <Badge variant={log.status === 'completed' ? 'default' : 'destructive'}>
                        {log.status}
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
};

export default MobileSyncDashboard;
