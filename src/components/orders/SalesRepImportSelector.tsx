import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Calendar, User, Download, RefreshCw, Settings, AlertTriangle, MapPin } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import { mobileOrderImportService } from '@/services/supabase/mobileOrderImportService';

interface SalesRepWithOrders {
  id: string;
  name: string;
  pendingOrdersCount: number;
  visitsCount: number;
  lastSync: Date | null;
  totalValue: number;
  ordersWithIssues: number;
}

interface SalesRepImportSelectorProps {
  onImportSalesRep: (salesRepId: string, salesRepName: string) => Promise<void>;
  onImportAll: () => Promise<void>;
  isImporting: boolean;
}

export default function SalesRepImportSelector({ 
  onImportSalesRep, 
  onImportAll, 
  isImporting 
}: SalesRepImportSelectorProps) {
  const [salesRepsWithOrders, setSalesRepsWithOrders] = useState<SalesRepWithOrders[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFixing, setIsFixing] = useState(false);

  const loadSalesRepsWithPendingOrders = async () => {
    try {
      setIsLoading(true);
      console.log('🔍 Loading sales reps with pending orders...');

      const { supabase } = await import('@/integrations/supabase/client');
      
      // Buscar pedidos mobile pendentes agrupados por vendedor
      const { data: pendingOrders, error } = await supabase
        .from('mobile_orders')
        .select(`
          sales_rep_id,
          sales_rep_name,
          total,
          status,
          created_at,
          payment_table_id,
          payment_table
        `)
        .eq('imported_to_orders', false)
        .not('sales_rep_id', 'is', null);

      if (error) {
        console.error('❌ Error loading pending mobile orders:', error);
        throw error;
      }

      if (!pendingOrders || pendingOrders.length === 0) {
        setSalesRepsWithOrders([]);
        return;
      }

      // Agrupar por vendedor
      const salesRepMap = new Map<string, SalesRepWithOrders>();

      pendingOrders.forEach(order => {
        const salesRepId = order.sales_rep_id;
        const salesRepName = order.sales_rep_name || 'Vendedor sem nome';

        if (!salesRepMap.has(salesRepId)) {
          salesRepMap.set(salesRepId, {
            id: salesRepId,
            name: salesRepName,
            pendingOrdersCount: 0,
            visitsCount: 0,
            lastSync: null,
            totalValue: 0,
            ordersWithIssues: 0
          });
        }

        const salesRep = salesRepMap.get(salesRepId)!;
        
        // Verificar se é pedido cancelado (visita) ou pedido normal
        const isCancelledOrder = order.status === 'cancelled' || order.status === 'canceled';
        const isVisit = isCancelledOrder || (order.total === 0);
        
        if (isVisit) {
          salesRep.visitsCount++;
        } else {
          salesRep.pendingOrdersCount++;
          salesRep.totalValue += Number(order.total || 0);
          
          // Verificar se tem problemas (sem tabela de pagamento quando deveria ter)
          // Pedidos cancelados NÃO precisam de tabela de pagamento
          if (!isCancelledOrder && order.total > 0 && !order.payment_table_id && !order.payment_table) {
            salesRep.ordersWithIssues++;
          }
        }
        
        // Atualizar data do último sync (mais recente)
        const orderDate = new Date(order.created_at);
        if (!salesRep.lastSync || orderDate > salesRep.lastSync) {
          salesRep.lastSync = orderDate;
        }
      });

      const salesRepsArray = Array.from(salesRepMap.values())
        .sort((a, b) => (b.lastSync?.getTime() || 0) - (a.lastSync?.getTime() || 0));

      setSalesRepsWithOrders(salesRepsArray);
      console.log(`✅ Found ${salesRepsArray.length} sales reps with pending orders/visits`);

    } catch (error) {
      console.error('❌ Error loading sales reps with pending orders:', error);
      toast.error('Erro ao carregar vendedores', {
        description: 'Não foi possível carregar a lista de vendedores com pedidos pendentes'
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFixDataInconsistencies = async () => {
    try {
      setIsFixing(true);
      console.log('🔧 Starting data inconsistency fix...');
      
      await mobileOrderImportService.fixExistingDataInconsistencies();
      
      toast.success('Inconsistências corrigidas', {
        description: 'Os dados foram corrigidos com sucesso'
      });
      
      // Recarregar a lista após a correção
      await loadSalesRepsWithPendingOrders();
      
    } catch (error) {
      console.error('❌ Error fixing data inconsistencies:', error);
      toast.error('Erro ao corrigir inconsistências', {
        description: 'Não foi possível corrigir as inconsistências nos dados'
      });
    } finally {
      setIsFixing(false);
    }
  };

  useEffect(() => {
    loadSalesRepsWithPendingOrders();
  }, []);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const totalPendingOrders = salesRepsWithOrders.reduce((sum, rep) => sum + rep.pendingOrdersCount, 0);
  const totalVisits = salesRepsWithOrders.reduce((sum, rep) => sum + rep.visitsCount, 0);
  const totalPendingValue = salesRepsWithOrders.reduce((sum, rep) => sum + rep.totalValue, 0);
  const totalOrdersWithIssues = salesRepsWithOrders.reduce((sum, rep) => sum + rep.ordersWithIssues, 0);

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center">
            <RefreshCw className="animate-spin mr-2" size={20} />
            Carregando vendedores...
          </div>
        </CardContent>
      </Card>
    );
  }

  if (salesRepsWithOrders.length === 0) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="text-center text-gray-500">
            <User size={48} className="mx-auto mb-4 opacity-50" />
            <p>Nenhum vendedor com pedidos pendentes</p>
            <p className="text-sm">Todos os pedidos mobile foram processados</p>
            
            <div className="mt-4">
              <Button
                variant="outline"
                size="sm"
                onClick={handleFixDataInconsistencies}
                disabled={isFixing}
              >
                {isFixing ? (
                  <RefreshCw size={16} className="animate-spin mr-2" />
                ) : (
                  <Settings size={16} className="mr-2" />
                )}
                Corrigir Inconsistências
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <User size={20} />
            Vendedores com Dados Pendentes
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleFixDataInconsistencies}
              disabled={isFixing || isImporting}
            >
              {isFixing ? (
                <RefreshCw size={16} className="animate-spin" />
              ) : (
                <Settings size={16} />
              )}
              Corrigir
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={loadSalesRepsWithPendingOrders}
              disabled={isLoading || isImporting}
            >
              <RefreshCw size={16} className={isLoading ? 'animate-spin' : ''} />
              Atualizar
            </Button>
          </div>
        </CardTitle>
        
        {/* Resumo geral com separação entre pedidos e visitas */}
        <div className="flex gap-4 text-sm text-gray-600 flex-wrap">
          <span>{salesRepsWithOrders.length} vendedores</span>
          <span className="flex items-center gap-1">
            <Download size={14} />
            {totalPendingOrders} pedidos
          </span>
          <span className="flex items-center gap-1">
            <MapPin size={14} />
            {totalVisits} visitas
          </span>
          <span>{formatCurrency(totalPendingValue)} em valor total</span>
          {totalOrdersWithIssues > 0 && (
            <span className="text-orange-600 flex items-center gap-1">
              <AlertTriangle size={14} />
              {totalOrdersWithIssues} com problemas
            </span>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Botão para importar todos */}
        <div className="flex justify-end">
          <Button
            onClick={onImportAll}
            disabled={isImporting || isFixing}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isImporting ? (
              <RefreshCw size={16} className="animate-spin mr-2" />
            ) : (
              <Download size={16} className="mr-2" />
            )}
            Processar Todos ({totalPendingOrders + totalVisits} itens)
          </Button>
        </div>

        {/* Lista de vendedores */}
        <div className="space-y-3">
          {salesRepsWithOrders.map((salesRep) => (
            <div
              key={salesRep.id}
              className="flex items-center justify-between p-4 border rounded-lg bg-white hover:bg-gray-50"
            >
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
                      {salesRep.lastSync 
                        ? formatDistanceToNow(salesRep.lastSync, { addSuffix: true, locale: ptBR })
                        : 'Nunca sincronizado'
                      }
                    </span>
                    <span>{formatCurrency(salesRep.totalValue)}</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {salesRep.pendingOrdersCount > 0 && (
                  <Badge variant="secondary" className="flex items-center gap-1">
                    <Download size={12} />
                    {salesRep.pendingOrdersCount} pedidos
                  </Badge>
                )}
                
                {salesRep.visitsCount > 0 && (
                  <Badge variant="outline" className="flex items-center gap-1">
                    <MapPin size={12} />
                    {salesRep.visitsCount} visitas
                  </Badge>
                )}
                
                {salesRep.ordersWithIssues > 0 && (
                  <Badge variant="destructive" className="flex items-center gap-1">
                    <AlertTriangle size={12} />
                    {salesRep.ordersWithIssues} problemas
                  </Badge>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onImportSalesRep(salesRep.id, salesRep.name)}
                  disabled={isImporting || isFixing}
                >
                  {isImporting ? (
                    <RefreshCw size={14} className="animate-spin" />
                  ) : (
                    <Download size={14} />
                  )}
                  Processar
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
