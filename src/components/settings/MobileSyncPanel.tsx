
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { CloudUpload, Users, Calendar } from "lucide-react";
import { useAppContext } from '@/hooks/useAppContext';
import { useToast } from "@/hooks/use-toast";
import { syncService, SyncLogEntry } from '@/services/supabase/syncService';
import { format } from 'date-fns';
import { Badge } from '@/components/ui/badge';

export default function MobileSyncPanel() {
  const { salesReps } = useAppContext();
  const { toast } = useToast();
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncLogs, setSyncLogs] = useState<SyncLogEntry[]>([]);
  const [selectedSalesRep, setSelectedSalesRep] = useState<string>('');
  const [isLoadingLogs, setIsLoadingLogs] = useState(false);

  // Function to handle data sync
  const handleSyncData = async () => {
    try {
      setIsSyncing(true);
      
      // If a sales rep is selected, only sync for that rep
      const repsToSync = selectedSalesRep ? [selectedSalesRep] : [];
      
      // Import syncMobileData dynamically to avoid circular dependencies
      const { syncMobileData } = await import('@/context/operations/systemOperations');
      await syncMobileData(repsToSync);
      
      // Refresh logs after sync
      if (selectedSalesRep) {
        fetchSyncLogs(selectedSalesRep);
      }
    } catch (error) {
      console.error('Error syncing data:', error);
      toast({
        title: "Erro na sincronização",
        description: "Não foi possível sincronizar os dados. Verifique a conexão e tente novamente.",
        variant: "destructive"
      });
    } finally {
      setIsSyncing(false);
    }
  };

  // Fetch sync logs for a specific sales rep
  const fetchSyncLogs = async (salesRepId: string) => {
    if (!salesRepId) return;
    
    setIsLoadingLogs(true);
    try {
      const logs = await syncService.getSyncLogs(salesRepId);
      setSyncLogs(logs);
    } catch (error) {
      console.error('Error fetching sync logs:', error);
      toast({
        title: "Erro ao carregar logs",
        description: "Não foi possível carregar o histórico de sincronização.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingLogs(false);
    }
  };

  // Handle sales rep selection change
  const handleSalesRepChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const repId = e.target.value;
    setSelectedSalesRep(repId);
    if (repId) {
      fetchSyncLogs(repId);
    } else {
      setSyncLogs([]);
    }
  };

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'dd/MM/yyyy HH:mm:ss');
    } catch (error) {
      return dateString;
    }
  };

  // Get badge color based on event type
  const getBadgeVariant = (eventType: string): "default" | "secondary" | "destructive" => {
    switch (eventType) {
      case 'upload': return 'default';
      case 'download': return 'secondary';
      case 'error': return 'destructive';
      default: return 'default';
    }
  };
  
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-xl flex items-center gap-2">
          <CloudUpload className="text-primary" size={20} />
          Sincronização de Dados Mobile
        </CardTitle>
        <CardDescription>
          Gere e sincronize dados para a equipe de vendas mobile.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <div className="space-y-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1">
              <label htmlFor="salesRep" className="block text-sm font-medium text-gray-700 mb-1">
                Vendedor
              </label>
              <select
                id="salesRep"
                className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary"
                value={selectedSalesRep}
                onChange={handleSalesRepChange}
              >
                <option value="">Todos os vendedores</option>
                {salesReps.map(rep => (
                  <option key={rep.id} value={rep.id}>{rep.name}</option>
                ))}
              </select>
            </div>
            <Button 
              onClick={handleSyncData}
              disabled={isSyncing}
              className="flex items-center gap-2"
            >
              <CloudUpload size={16} className={isSyncing ? "animate-spin" : ""} />
              {isSyncing ? "Sincronizando..." : "Sincronizar Dados"}
            </Button>
          </div>
          
          {selectedSalesRep && (
            <div className="mt-6">
              <h3 className="text-md font-medium mb-3 flex items-center gap-2">
                <Calendar size={16} />
                Histórico de Sincronização
              </h3>
              
              {isLoadingLogs ? (
                <p className="text-sm text-gray-500">Carregando histórico...</p>
              ) : syncLogs.length > 0 ? (
                <div className="border rounded-md overflow-hidden">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Data
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Evento
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                          Dispositivo
                        </th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {syncLogs.map((log) => (
                        <tr key={log.id}>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {formatDate(log.created_at)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge variant={getBadgeVariant(log.event_type)}>
                              {log.event_type === 'upload' ? 'Envio' : 
                               log.event_type === 'download' ? 'Download' : 'Erro'}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                            {log.device_id}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : (
                <p className="text-sm text-gray-500">Nenhum registro de sincronização encontrado.</p>
              )}
            </div>
          )}
          
          <div className="mt-4 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium mb-2 flex items-center gap-2">
              <Users size={16} />
              Informações Sincronizadas
            </h4>
            <ul className="list-disc pl-5 text-sm text-gray-600 space-y-1">
              <li>Clientes atribuídos à rota do vendedor</li>
              <li>Catálogo completo de produtos com preços</li>
              <li>Histórico de pedidos do vendedor</li>
              <li>Informações de pagamentos</li>
            </ul>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
