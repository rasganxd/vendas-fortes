import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, User, Download, RefreshCw, AlertTriangle, Bug } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
interface SalesRepWithOrders {
  id: string;
  name: string;
  pendingOrdersCount: number;
  lastSync: Date | null;
  totalValue: number;
}
interface OrphanedOrder {
  id: string;
  customer_name: string;
  total: number;
  created_at: string;
}
interface SalesRepImportSelectorProps {
  onImportSalesRep: (salesRepId: string, salesRepName: string) => Promise<void>;
  onImportAll: () => Promise<void>;
  onImportOrphaned?: () => Promise<void>;
  isImporting: boolean;
}
export default function SalesRepImportSelector({
  onImportSalesRep,
  onImportAll,
  onImportOrphaned,
  isImporting
}: SalesRepImportSelectorProps) {
  const [salesRepsWithOrders, setSalesRepsWithOrders] = useState<SalesRepWithOrders[]>([]);
  const [orphanedOrders, setOrphanedOrders] = useState<OrphanedOrder[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [debugInfo, setDebugInfo] = useState({
    lastLoad: '',
    totalFound: 0,
    withSalesRep: 0,
    orphaned: 0,
    error: ''
  });
  const loadSalesRepsWithPendingOrders = async (forceRefresh = false) => {
    try {
      setIsLoading(true);
      console.log('🔍 [DEBUG] Loading sales reps with pending orders and orphaned orders...', {
        forceRefresh
      });
      const {
        supabase
      } = await import('@/integrations/supabase/client');

      // Buscar TODOS os pedidos pendentes na tabela orders_mobile
      const {
        data: pendingOrders,
        error
      } = await supabase.from('orders_mobile').select(`
          sales_rep_id,
          sales_rep_name,
          total,
          created_at,
          customer_name,
          id
        `).eq('imported', false);
      if (error) {
        console.error('❌ [DEBUG] Error loading pending orders:', error);
        setDebugInfo(prev => ({
          ...prev,
          lastLoad: new Date().toISOString(),
          error: error.message
        }));
        throw error;
      }
      if (!pendingOrders || pendingOrders.length === 0) {
        console.log('ℹ️ [DEBUG] No pending orders found');
        setSalesRepsWithOrders([]);
        setOrphanedOrders([]);
        setDebugInfo({
          lastLoad: new Date().toISOString(),
          totalFound: 0,
          withSalesRep: 0,
          orphaned: 0,
          error: ''
        });
        return;
      }
      console.log(`📋 [DEBUG] Found ${pendingOrders.length} total pending orders:`, pendingOrders);

      // Separar pedidos com vendedor vs órfãos
      const ordersWithSalesRep = pendingOrders.filter(order => order.sales_rep_id && order.sales_rep_name);
      const orphanedOrdersList = pendingOrders.filter(order => !order.sales_rep_id);
      console.log(`📊 [DEBUG] Breakdown: ${ordersWithSalesRep.length} with sales rep, ${orphanedOrdersList.length} orphaned`);

      // Processar pedidos órfãos
      const orphans: OrphanedOrder[] = orphanedOrdersList.map(order => ({
        id: order.id,
        customer_name: order.customer_name || 'Cliente sem nome',
        total: Number(order.total || 0),
        created_at: order.created_at
      }));
      setOrphanedOrders(orphans);
      console.log(`⚠️ [DEBUG] Set ${orphans.length} orphaned orders:`, orphans);

      // Agrupar por vendedor (apenas pedidos com vendedor)
      const salesRepMap = new Map<string, SalesRepWithOrders>();
      ordersWithSalesRep.forEach(order => {
        const salesRepId = order.sales_rep_id!;
        const salesRepName = order.sales_rep_name || 'Vendedor sem nome';
        if (!salesRepMap.has(salesRepId)) {
          salesRepMap.set(salesRepId, {
            id: salesRepId,
            name: salesRepName,
            pendingOrdersCount: 0,
            lastSync: null,
            totalValue: 0
          });
        }
        const salesRep = salesRepMap.get(salesRepId)!;
        salesRep.pendingOrdersCount++;
        salesRep.totalValue += Number(order.total || 0);

        // Atualizar data do último sync (mais recente)
        const orderDate = new Date(order.created_at);
        if (!salesRep.lastSync || orderDate > salesRep.lastSync) {
          salesRep.lastSync = orderDate;
        }
      });
      const salesRepsArray = Array.from(salesRepMap.values()).sort((a, b) => (b.lastSync?.getTime() || 0) - (a.lastSync?.getTime() || 0));
      setSalesRepsWithOrders(salesRepsArray);
      console.log(`✅ [DEBUG] Set ${salesRepsArray.length} sales reps with pending orders:`, salesRepsArray);

      // Update debug info
      setDebugInfo({
        lastLoad: new Date().toISOString(),
        totalFound: pendingOrders.length,
        withSalesRep: ordersWithSalesRep.length,
        orphaned: orphanedOrdersList.length,
        error: ''
      });

      // Toast de debug
      toast.success(`Debug: Dados carregados`, {
        description: `${salesRepsArray.length} vendedores, ${orphans.length} órfãos, ${pendingOrders.length} total`
      });
    } catch (error) {
      console.error('❌ [DEBUG] Error loading sales reps with pending orders:', error);
      setDebugInfo(prev => ({
        ...prev,
        lastLoad: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Erro desconhecido'
      }));
      toast.error('Erro ao carregar vendedores', {
        description: 'Não foi possível carregar a lista de vendedores com pedidos pendentes'
      });
    } finally {
      setIsLoading(false);
    }
  };
  useEffect(() => {
    console.log('🚀 [DEBUG] SalesRepImportSelector mounted, loading data...');
    loadSalesRepsWithPendingOrders(true);
  }, []);
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };
  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };
  const showDebugInfo = () => {
    toast.info('Debug Info - Selector', {
      description: `Última carga: ${debugInfo.lastLoad}\nTotal: ${debugInfo.totalFound}\nCom vendedor: ${debugInfo.withSalesRep}\nÓrfãos: ${debugInfo.orphaned}${debugInfo.error ? `\nErro: ${debugInfo.error}` : ''}`
    });
  };
  const totalPendingOrders = salesRepsWithOrders.reduce((sum, rep) => sum + rep.pendingOrdersCount, 0) + orphanedOrders.length;
  const totalPendingValue = salesRepsWithOrders.reduce((sum, rep) => sum + rep.totalValue, 0) + orphanedOrders.reduce((sum, order) => sum + order.total, 0);
  if (isLoading) {
    return <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="animate-spin mr-2" size={20} />
            Carregando vendedores...
            <Button size="sm" variant="ghost" className="ml-2 p-1 h-6 w-6" onClick={showDebugInfo}>
              <Bug size={12} />
            </Button>
          </div>
        </CardContent>
      </Card>;
  }
  if (salesRepsWithOrders.length === 0 && orphanedOrders.length === 0) {
    return <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <User size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhum pedido pendente encontrado</p>
            
            
            {/* Debug info para caso vazio */}
            
          </div>
        </CardContent>
      </Card>;
  }
  return <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={20} />
            Pedidos Mobile Pendentes
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={() => loadSalesRepsWithPendingOrders(true)} disabled={isLoading}>
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Atualizar
            </Button>
            <Button size="sm" variant="ghost" className="p-1 h-6 w-6" onClick={showDebugInfo}>
              <Bug size={12} />
            </Button>
          </div>
        </CardTitle>
        
        {/* Resumo geral */}
        <div className="flex gap-4 text-sm text-gray-600">
          <span>{salesRepsWithOrders.length} vendedores</span>
          <span>{totalPendingOrders} pedidos pendentes</span>
          <span>{formatCurrency(totalPendingValue)} em valor total</span>
          {orphanedOrders.length > 0 && <span className="text-amber-600 font-medium">{orphanedOrders.length} órfãos</span>}
        </div>
        
        {/* Debug info resumido */}
        <div className="text-xs text-gray-400">
          Debug: {debugInfo.totalFound} no banco | Última carga: {debugInfo.lastLoad ? new Date(debugInfo.lastLoad).toLocaleTimeString() : 'nunca'}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Botão para importar todos */}
        <div className="flex justify-end">
          <Button onClick={onImportAll} disabled={isImporting} className="bg-blue-600 hover:bg-blue-700">
            {isImporting ? <RefreshCw size={16} className="animate-spin mr-2" /> : <Download size={16} className="mr-2" />}
            Importar Todos ({totalPendingOrders} pedidos)
          </Button>
        </div>

        {/* Seção de pedidos órfãos */}
        {orphanedOrders.length > 0 && <Card className="border-amber-200 bg-amber-50">
            <CardHeader className="pb-3">
              <CardTitle className="text-amber-800 flex items-center gap-2 text-base">
                <AlertTriangle size={16} />
                Pedidos Órfãos (Sem Vendedor)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="text-sm text-amber-700">
                  <span>{orphanedOrders.length} pedidos sem vendedor associado</span>
                  <span className="ml-4">{formatCurrency(orphanedOrders.reduce((sum, order) => sum + order.total, 0))}</span>
                </div>
                {onImportOrphaned && <Button variant="outline" size="sm" onClick={onImportOrphaned} disabled={isImporting} className="border-amber-300 text-amber-700 hover:bg-amber-100">
                    {isImporting ? <RefreshCw size={14} className="animate-spin mr-1" /> : <Download size={14} className="mr-1" />}
                    Importar Órfãos
                  </Button>}
              </div>
              
              {/* Lista de pedidos órfãos */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
                {orphanedOrders.slice(0, 6).map(order => <div key={order.id} className="bg-white p-2 rounded border border-amber-200">
                    <div className="font-medium text-amber-800">{order.customer_name}</div>
                    <div className="text-amber-600">{formatCurrency(order.total)}</div>
                  </div>)}
                {orphanedOrders.length > 6 && <div className="text-amber-600 text-center">
                    +{orphanedOrders.length - 6} mais...
                  </div>}
              </div>
            </CardContent>
          </Card>}

        {/* Lista de vendedores */}
        {salesRepsWithOrders.length > 0 && <div className="space-y-3">
            <h4 className="text-sm font-medium text-gray-700">Vendedores com Pedidos</h4>
            {salesRepsWithOrders.map(salesRep => <div key={salesRep.id} className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50">
                <div className="flex items-center gap-3">
                  <Avatar>
                    <AvatarFallback className="bg-blue-100 text-blue-600">
                      {getInitials(salesRep.name)}
                    </AvatarFallback>
                  </Avatar>
                  
                  <div>
                    <div className="font-medium">{salesRep.name}</div>
                    <div className="text-sm text-gray-500 flex items-center gap-4">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        {salesRep.lastSync ? formatDistanceToNow(salesRep.lastSync, {
                    addSuffix: true,
                    locale: ptBR
                  }) : 'Nunca sincronizado'}
                      </span>
                      <span>{formatCurrency(salesRep.totalValue)}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Badge variant="secondary">
                    {salesRep.pendingOrdersCount} pedidos
                  </Badge>
                  
                  <Button variant="outline" size="sm" onClick={() => onImportSalesRep(salesRep.id, salesRep.name)} disabled={isImporting}>
                    {isImporting ? <RefreshCw size={14} className="animate-spin" /> : <Download size={14} />}
                    Importar
                  </Button>
                </div>
              </div>)}
          </div>}
      </CardContent>
    </Card>;
}