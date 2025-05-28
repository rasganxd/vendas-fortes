
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  RefreshCw, 
  Activity, 
  CheckCircle, 
  AlertTriangle, 
  Clock,
  Smartphone,
  Database,
  Users,
  Wifi,
  WifiOff
} from 'lucide-react';
import { syncUpdateService, SyncUpdate } from '@/services/supabase/syncUpdateService';
import { useSalesReps } from '@/hooks/useSalesReps';
import { useSalesRepSyncStatus } from '@/hooks/useSalesRepSyncStatus';
import { GenerateSyncUpdateDialog } from './GenerateSyncUpdateDialog';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';

const SyncUpdateMonitor: React.FC = () => {
  const [syncUpdates, setSyncUpdates] = useState<SyncUpdate[]>([]);
  const [stats, setStats] = useState({
    activeUpdates: 0,
    consumedUpdates: 0,
    orphanedUpdates: 0
  });
  const [isLoading, setIsLoading] = useState(false);
  const [isReactivating, setIsReactivating] = useState(false);
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);

  const { salesReps } = useSalesReps();
  const { syncStatuses, isLoading: statusLoading, refreshStatuses } = useSalesRepSyncStatus(salesReps);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [updates, statsData] = await Promise.all([
        syncUpdateService.getActiveSyncUpdates(),
        syncUpdateService.getSyncStats()
      ]);
      
      setSyncUpdates(updates);
      setStats(statsData);
      refreshStatuses();
    } catch (error) {
      console.error('Error loading sync data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleReactivateOrphaned = async () => {
    setIsReactivating(true);
    try {
      const reactivatedCount = await syncUpdateService.reactivateOrphanedUpdates(1); // 1 hora
      
      if (reactivatedCount > 0) {
        toast.success(`${reactivatedCount} atualizações reativadas`);
        await loadData(); // Recarregar dados
      } else {
        toast.info('Nenhuma atualização órfã encontrada');
      }
    } catch (error) {
      console.error('Error reactivating orphaned updates:', error);
      toast.error('Erro ao reativar atualizações órfãs');
    } finally {
      setIsReactivating(false);
    }
  };

  const handleGenerateUpdate = async (salesRepId: string | null, dataTypes: string[], description: string) => {
    try {
      const result = await syncUpdateService.createSyncUpdate(
        dataTypes,
        description,
        'desktop'
      );
      
      if (result.success) {
        toast.success('Atualização gerada com sucesso!');
        await loadData();
      } else {
        toast.error('Erro ao gerar atualização: ' + result.error);
      }
    } catch (error) {
      console.error('Error generating update:', error);
      toast.error('Erro ao gerar atualização');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online': return 'text-green-600 bg-green-100';
      case 'pending': return 'text-yellow-600 bg-yellow-100';
      case 'error': return 'text-red-600 bg-red-100';
      default: return 'text-gray-600 bg-gray-100';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online': return <Wifi className="h-4 w-4" />;
      case 'pending': return <Clock className="h-4 w-4" />;
      case 'error': return <AlertTriangle className="h-4 w-4" />;
      default: return <WifiOff className="h-4 w-4" />;
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'online': return 'Online';
      case 'pending': return 'Sync Pendente';
      case 'error': return 'Erro';
      default: return 'Offline';
    }
  };

  useEffect(() => {
    loadData();
    
    // Auto-refresh a cada 30 segundos
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-medium">Monitor de Sincronização Mobile</h3>
        <div className="flex gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={loadData}
            disabled={isLoading}
          >
            <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            Atualizar
          </Button>
          <Button
            size="sm"
            onClick={() => setGenerateDialogOpen(true)}
            className="bg-blue-600 hover:bg-blue-700"
          >
            <Database className="mr-2 h-4 w-4" />
            Gerar Atualização
          </Button>
        </div>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Atualizações Ativas</p>
                <p className="text-2xl font-bold text-blue-600">{stats.activeUpdates}</p>
              </div>
              <Activity className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Consumidas</p>
                <p className="text-2xl font-bold text-green-600">{stats.consumedUpdates}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Órfãs</p>
                <p className="text-2xl font-bold text-orange-600">{stats.orphanedUpdates}</p>
              </div>
              <AlertTriangle className="h-8 w-8 text-orange-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Status dos Vendedores */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Status dos Vendedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          {statusLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-blue-600" />
            </div>
          ) : syncStatuses.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Users className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum vendedor cadastrado</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {syncStatuses.map((statusInfo) => (
                <div 
                  key={statusInfo.salesRep.id} 
                  className="border rounded-lg p-4 bg-white hover:shadow-md transition-shadow"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-900">{statusInfo.salesRep.name}</h4>
                      <p className="text-sm text-gray-500">Código: {statusInfo.salesRep.code}</p>
                    </div>
                    <Badge className={`${getStatusColor(statusInfo.status)} border-0`}>
                      <div className="flex items-center gap-1">
                        {getStatusIcon(statusInfo.status)}
                        {getStatusLabel(statusInfo.status)}
                      </div>
                    </Badge>
                  </div>
                  
                  <div className="space-y-2 text-sm">
                    {statusInfo.lastSyncAt ? (
                      <p className="text-gray-600">
                        Última sync: {formatDistanceToNow(new Date(statusInfo.lastSyncAt), { 
                          addSuffix: true, 
                          locale: ptBR 
                        })}
                      </p>
                    ) : (
                      <p className="text-gray-500 italic">Nunca sincronizou</p>
                    )}
                    
                    {statusInfo.pendingUpdatesCount > 0 && (
                      <p className="text-yellow-600 font-medium">
                        {statusInfo.pendingUpdatesCount} atualização(ões) pendente(s)
                      </p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Alerta para atualizações órfãs */}
      {stats.orphanedUpdates > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <AlertTriangle className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            Existem {stats.orphanedUpdates} atualizações órfãs (marcadas como inativas mas não consumidas).
            <Button
              variant="link"
              size="sm"
              onClick={handleReactivateOrphaned}
              disabled={isReactivating}
              className="ml-2 p-0 h-auto text-orange-600 underline"
            >
              {isReactivating ? 'Reativando...' : 'Reativar agora'}
            </Button>
          </AlertDescription>
        </Alert>
      )}

      {/* Lista de Atualizações Ativas */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Smartphone className="h-5 w-5" />
            Atualizações Pendentes para Mobile
          </CardTitle>
        </CardHeader>
        <CardContent>
          {syncUpdates.length === 0 ? (
            <div className="text-center py-8 text-gray-500">
              <Clock className="h-12 w-12 mx-auto mb-4 opacity-50" />
              <p>Nenhuma atualização pendente</p>
              <p className="text-sm mt-1">Todas as atualizações foram sincronizadas</p>
            </div>
          ) : (
            <div className="space-y-4">
              {syncUpdates.map((update) => (
                <div key={update.id} className="border rounded-lg p-4 bg-blue-50 border-blue-200">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <Badge variant="secondary" className="bg-blue-100 text-blue-800">
                          Ativa
                        </Badge>
                        {update.data_types.map(type => (
                          <Badge key={type} variant="outline" className="text-xs">
                            {type}
                          </Badge>
                        ))}
                      </div>
                      
                      <p className="font-medium text-blue-900">
                        {update.description || `Atualização de ${update.data_types.join(', ')}`}
                      </p>
                      
                      <div className="text-sm text-blue-700 mt-1">
                        <p>Criada: {formatDistanceToNow(new Date(update.created_at), { addSuffix: true, locale: ptBR })}</p>
                        {update.created_by_user && (
                          <p>Por: {update.created_by_user}</p>
                        )}
                      </div>
                    </div>
                    
                    <div className="text-right text-xs text-blue-600">
                      ID: {update.id.substring(0, 8)}...
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Dialog para gerar atualizações */}
      <GenerateSyncUpdateDialog
        open={generateDialogOpen}
        onOpenChange={setGenerateDialogOpen}
        salesReps={salesReps}
        onGenerateUpdate={handleGenerateUpdate}
      />
    </div>
  );
};

export default SyncUpdateMonitor;
