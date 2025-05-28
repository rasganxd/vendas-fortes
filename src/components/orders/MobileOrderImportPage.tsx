
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Smartphone, Download, RefreshCw, Clock, User, Package } from 'lucide-react';
import { useMobileOrders } from '@/hooks/useMobileOrders';
import { useSalesReps } from '@/hooks/useSalesReps';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function MobileOrderImportPage() {
  const { 
    pendingOrders, 
    importedOrders, 
    syncStatus, 
    isLoading, 
    isImporting,
    loadPendingOrders,
    loadImportedOrders,
    importOrders,
    reimportOrder
  } = useMobileOrders();
  
  const { salesReps } = useSalesReps();
  const [selectedSalesRep, setSelectedSalesRep] = useState<string>('all');

  // Carregar dados quando o vendedor selecionado mudar
  useEffect(() => {
    const salesRepId = selectedSalesRep === 'all' ? undefined : selectedSalesRep;
    loadPendingOrders(salesRepId);
    loadImportedOrders(salesRepId);
  }, [selectedSalesRep, loadPendingOrders, loadImportedOrders]);

  const handleImport = async () => {
    const salesRepId = selectedSalesRep === 'all' ? undefined : selectedSalesRep;
    await importOrders(salesRepId);
  };

  const handleReimport = async (mobileOrderId: string) => {
    await reimportOrder(mobileOrderId);
  };

  const selectedSalesRepStatus = syncStatus.find(s => s.sales_rep_id === selectedSalesRep);
  const totalPending = selectedSalesRep === 'all' 
    ? syncStatus.reduce((sum, s) => sum + s.pending_orders, 0)
    : selectedSalesRepStatus?.pending_orders || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Importação de Pedidos Mobile</h1>
          <p className="text-gray-600">Gerencie a importação manual dos pedidos recebidos do Mobile</p>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedSalesRep} onValueChange={setSelectedSalesRep}>
            <SelectTrigger className="w-48">
              <SelectValue placeholder="Selecionar vendedor" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os vendedores</SelectItem>
              {salesReps.map(rep => (
                <SelectItem key={rep.id} value={rep.id}>
                  {rep.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button
            onClick={handleImport}
            disabled={isImporting || totalPending === 0}
            className="bg-blue-600 hover:bg-blue-700"
          >
            {isImporting ? (
              <RefreshCw size={16} className="mr-2 animate-spin" />
            ) : (
              <Download size={16} className="mr-2" />
            )}
            Importar Pedidos
            {totalPending > 0 && (
              <Badge variant="secondary" className="ml-2">
                {totalPending}
              </Badge>
            )}
          </Button>
        </div>
      </div>

      {/* Status de Sincronização */}
      {selectedSalesRep !== 'all' && selectedSalesRepStatus && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User size={20} />
              Status de Sincronização
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedSalesRepStatus.pending_orders}
                </div>
                <div className="text-sm text-gray-600">Pedidos Pendentes</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  <Clock size={20} className="inline mr-1" />
                </div>
                <div className="text-sm text-gray-600">
                  {selectedSalesRepStatus.last_sync 
                    ? `Última sincronização: ${formatDistanceToNow(new Date(selectedSalesRepStatus.last_sync), { addSuffix: true, locale: ptBR })}`
                    : 'Nunca sincronizou'
                  }
                </div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {selectedSalesRepStatus.sales_rep_name}
                </div>
                <div className="text-sm text-gray-600">Vendedor</div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Resumo Geral para Todos os Vendedores */}
      {selectedSalesRep === 'all' && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {syncStatus.map(status => (
            <Card key={status.sales_rep_id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="font-semibold">{status.sales_rep_name}</div>
                    <div className="text-sm text-gray-600">
                      {status.pending_orders} pedidos pendentes
                    </div>
                    <div className="text-xs text-gray-500">
                      {status.last_sync 
                        ? `Última sync: ${formatDistanceToNow(new Date(status.last_sync), { addSuffix: true, locale: ptBR })}`
                        : 'Nunca sincronizou'
                      }
                    </div>
                  </div>
                  <Badge variant={status.pending_orders > 0 ? "default" : "secondary"}>
                    {status.pending_orders}
                  </Badge>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Tabs de Pedidos */}
      <Tabs defaultValue="pending" className="space-y-4">
        <TabsList>
          <TabsTrigger value="pending" className="flex items-center gap-2">
            <Package size={16} />
            Pedidos Pendentes
            {totalPending > 0 && (
              <Badge variant="secondary" className="ml-1">
                {totalPending}
              </Badge>
            )}
          </TabsTrigger>
          <TabsTrigger value="imported">
            <Smartphone size={16} className="mr-2" />
            Pedidos Importados
          </TabsTrigger>
        </TabsList>

        <TabsContent value="pending">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Aguardando Importação</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Carregando pedidos...</div>
              ) : pendingOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum pedido pendente de importação
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingOrders.map(order => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">Pedido #{order.code}</div>
                          <div className="text-sm text-gray-600">
                            Cliente: {order.customer_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Vendedor: {order.sales_rep_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Criado: {formatDistanceToNow(new Date(order.created_at), { addSuffix: true, locale: ptBR })}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.items?.length || 0} itens
                          </div>
                          <Badge variant="outline" className="mt-1">
                            {order.status}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="imported">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Importados (Backup)</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="text-center py-8">Carregando pedidos...</div>
              ) : importedOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Nenhum pedido importado encontrado
                </div>
              ) : (
                <div className="space-y-4">
                  {importedOrders.map(order => (
                    <div key={order.id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-semibold">Pedido #{order.code}</div>
                          <div className="text-sm text-gray-600">
                            Cliente: {order.customer_name}
                          </div>
                          <div className="text-sm text-gray-600">
                            Vendedor: {order.sales_rep_name}
                          </div>
                          <div className="text-sm text-gray-500">
                            Importado: {order.imported_at ? formatDistanceToNow(new Date(order.imported_at), { addSuffix: true, locale: ptBR }) : 'N/A'}
                          </div>
                          <div className="text-sm text-gray-500">
                            Por: {order.imported_by || 'N/A'}
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="font-semibold text-lg">
                            {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </div>
                          <div className="text-sm text-gray-600">
                            {order.items?.length || 0} itens
                          </div>
                          <Badge variant="secondary" className="mt-1">
                            Importado
                          </Badge>
                          <Button
                            variant="outline"
                            size="sm"
                            className="ml-2 mt-1"
                            onClick={() => handleReimport(order.id)}
                            disabled={isImporting}
                          >
                            Reimportar
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
