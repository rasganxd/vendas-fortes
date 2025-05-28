import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Download, 
  Upload, 
  RefreshCw, 
  AlertCircle, 
  CheckCircle, 
  XCircle,
  Clock,
  Smartphone,
  Trash2,
  User,
  AlertTriangle
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

interface SalesRepStats {
  sales_rep_id: string;
  sales_rep_name: string;
  pending_orders: number;
  total_imported: number;
  last_sync: Date | null;
}

interface OrphanOrder {
  id: string;
  code: number;
  customer_name: string;
  sales_rep_id: string;
  sales_rep_name: string;
  total: number;
  created_at: string;
  source_project: string;
  imported: boolean;
}

export default function MobileOrderImportPanel() {
  const [stats, setStats] = useState<ImportStats>({
    totalImported: 0,
    todayImported: 0,
    failedImports: 0,
    lastImport: undefined
  });
  const [logs, setLogs] = useState<ImportLog[]>([]);
  const [salesRepStats, setSalesRepStats] = useState<SalesRepStats[]>([]);
  const [orphanOrders, setOrphanOrders] = useState<OrphanOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);
  const [isFixingOrphans, setIsFixingOrphans] = useState(false);

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

  const loadOrphanOrders = async () => {
    try {
      console.log('🔍 Verificando pedidos órfãos (imported=true mas source_project=mobile)...');
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Buscar pedidos que estão marcados como importados mas vieram do mobile
      // Isso indica que foram criados diretamente pelo mobile, não pelo processo de importação
      const { data: orphans, error } = await supabase
        .from('orders')
        .select('id, code, customer_name, sales_rep_id, sales_rep_name, total, created_at, source_project, imported')
        .eq('source_project', 'mobile')
        .eq('imported', true); // Estes são órfãos - não deveriam estar importados automaticamente

      if (error) throw error;

      setOrphanOrders(orphans || []);
      console.log(`⚠️ Encontrados ${orphans?.length || 0} pedidos órfãos`);

    } catch (error) {
      console.error('Erro ao verificar pedidos órfãos:', error);
    }
  };

  const fixOrphanOrders = async () => {
    try {
      setIsFixingOrphans(true);
      console.log('🔧 Corrigindo pedidos órfãos...');

      const { supabase } = await import('@/integrations/supabase/client');

      // Marcar todos os pedidos órfãos como não importados
      const { error } = await supabase
        .from('orders')
        .update({ imported: false, updated_at: new Date().toISOString() })
        .eq('source_project', 'mobile')
        .eq('imported', true);

      if (error) throw error;

      toast.success('Pedidos órfãos corrigidos', {
        description: `${orphanOrders.length} pedidos foram marcados como não importados`
      });

      // Recarregar dados
      await Promise.all([loadOrphanOrders(), loadSalesRepStats()]);

    } catch (error) {
      console.error('Erro ao corrigir pedidos órfãos:', error);
      toast.error('Erro ao corrigir pedidos órfãos');
    } finally {
      setIsFixingOrphans(false);
    }
  };

  const loadSalesRepStats = async () => {
    try {
      console.log('📊 Loading sales rep statistics...');
      
      const { supabase } = await import('@/integrations/supabase/client');
      
      // Buscar estatísticas por vendedor
      const { data: pendingData, error: pendingError } = await supabase
        .from('orders')
        .select('sales_rep_id, sales_rep_name, created_at')
        .eq('source_project', 'mobile')
        .eq('imported', false)
        .not('sales_rep_id', 'is', null);

      if (pendingError) throw pendingError;

      const { data: importedData, error: importedError } = await supabase
        .from('orders')
        .select('sales_rep_id, sales_rep_name, updated_at')
        .eq('source_project', 'mobile')
        .eq('imported', true)
        .not('sales_rep_id', 'is', null);

      if (importedError) throw importedError;

      // Agrupar por vendedor
      const statsMap = new Map<string, SalesRepStats>();

      // Processar pedidos pendentes
      pendingData?.forEach(order => {
        const key = order.sales_rep_id;
        if (!statsMap.has(key)) {
          statsMap.set(key, {
            sales_rep_id: key,
            sales_rep_name: order.sales_rep_name || 'Vendedor sem nome',
            pending_orders: 0,
            total_imported: 0,
            last_sync: null
          });
        }
        
        const stat = statsMap.get(key)!;
        stat.pending_orders++;
        
        const syncDate = new Date(order.created_at);
        if (!stat.last_sync || syncDate > stat.last_sync) {
          stat.last_sync = syncDate;
        }
      });

      // Processar pedidos importados
      importedData?.forEach(order => {
        const key = order.sales_rep_id;
        if (!statsMap.has(key)) {
          statsMap.set(key, {
            sales_rep_id: key,
            sales_rep_name: order.sales_rep_name || 'Vendedor sem nome',
            pending_orders: 0,
            total_imported: 0,
            last_sync: null
          });
        }
        
        const stat = statsMap.get(key)!;
        stat.total_imported++;
      });

      const statsArray = Array.from(statsMap.values())
        .sort((a, b) => (b.last_sync?.getTime() || 0) - (a.last_sync?.getTime() || 0));

      setSalesRepStats(statsArray);
      console.log(`✅ Loaded stats for ${statsArray.length} sales reps`);

    } catch (error) {
      console.error('Erro ao carregar estatísticas de vendedores:', error);
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
    await Promise.all([loadStats(), loadLogs(), loadSalesRepStats(), loadOrphanOrders()]);
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
          {/* Alerta sobre pedidos órfãos */}
          {orphanOrders.length > 0 && (
            <Alert className="border-orange-200 bg-orange-50">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <AlertDescription className="text-orange-800">
                <div className="flex items-center justify-between">
                  <div>
                    <strong>Problema detectado:</strong> {orphanOrders.length} pedidos mobile apareceram no sistema sem passar pelo processo de importação.
                    <div className="text-sm mt-1">
                      Estes pedidos devem ser marcados como "não importados" para seguir o fluxo correto.
                    </div>
                  </div>
                  <Button 
                    variant="outline"
                    size="sm"
                    onClick={fixOrphanOrders}
                    disabled={isFixingOrphans}
                    className="ml-4"
                  >
                    {isFixingOrphans ? 'Corrigindo...' : 'Corrigir'}
                  </Button>
                </div>
              </AlertDescription>
            </Alert>
          )}

          {/* Estatísticas gerais */}
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

          {/* Estatísticas por vendedor */}
          <div>
            <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <User size={20} />
              Estatísticas por Vendedor
            </h3>
            
            {salesRepStats.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                Nenhum vendedor com pedidos mobile encontrado
              </div>
            ) : (
              <div className="space-y-2">
                {salesRepStats.map((stat) => (
                  <div key={stat.sales_rep_id} className="flex items-center justify-between p-3 border rounded-lg bg-white">
                    <div>
                      <div className="font-medium">{stat.sales_rep_name}</div>
                      <div className="text-sm text-gray-500">
                        {stat.last_sync 
                          ? `Última sync: ${formatDistanceToNow(stat.last_sync, { addSuffix: true, locale: ptBR })}`
                          : 'Nunca sincronizado'
                        }
                      </div>
                    </div>
                    <div className="flex gap-2">
                      {stat.pending_orders > 0 && (
                        <Badge variant="secondary" className="bg-orange-100 text-orange-800">
                          {stat.pending_orders} pendentes
                        </Badge>
                      )}
                      <Badge variant="secondary" className="bg-green-100 text-green-800">
                        {stat.total_imported} importados
                      </Badge>
                    </div>
                  </div>
                ))}
              </div>
            )}
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

          {/* Documentação */}
          <div className="text-sm text-gray-600 bg-blue-50 rounded-lg p-4">
            <h4 className="font-semibold mb-2 text-blue-800">⚠️ Importante - Configuração Mobile:</h4>
            <ul className="list-disc list-inside space-y-1 text-blue-700">
              <li><strong>Endpoint correto:</strong> O mobile deve usar <code>/mobile-orders-import</code> para enviar pedidos</li>
              <li><strong>Não usar:</strong> O endpoint <code>/orders-api</code> foi bloqueado para criar pedidos mobile</li>
              <li><strong>Fluxo correto:</strong> Mobile envia → Fica pendente → Importação manual no Desktop</li>
              <li><strong>Validação:</strong> Sistema agora detecta e corrige pedidos que aparecem sem importação</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
