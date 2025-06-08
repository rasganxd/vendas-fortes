
import React from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { Download, X, RefreshCw, Smartphone, History } from 'lucide-react';
import { useMobileOrderImport } from '@/hooks/useMobileOrderImport';
import SalesRepSection from '@/components/mobile-import/SalesRepSection';
import ImportHistoryTable from '@/components/mobile-import/ImportHistoryTable';

export default function MobileOrdersImport() {
  const {
    pendingOrders,
    importHistory,
    ordersBySalesRep,
    selectedOrderIds,
    isLoading,
    isImporting,
    toggleOrderSelection,
    selectAllOrdersFromSalesRep,
    importSelectedOrders,
    rejectSelectedOrders,
    refreshData
  } = useMobileOrderImport();

  const totalPendingValue = pendingOrders.reduce((sum, order) => sum + order.total, 0);
  const salesRepSections = Object.values(ordersBySalesRep);

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  return (
    <PageLayout title="Importação de Pedidos Mobile" subtitle="Gerencie a importação de pedidos enviados do aplicativo mobile">
      <div className="space-y-6">
        {/* Action Bar */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <Smartphone className="h-5 w-5 text-blue-600" />
                  <CardTitle className="text-lg">Controle de Importação</CardTitle>
                </div>
                <Badge variant="outline" className="text-blue-600 border-blue-600">
                  {pendingOrders.length} pedidos pendentes
                </Badge>
                {totalPendingValue > 0 && (
                  <Badge variant="outline" className="text-green-600 border-green-600">
                    {formatCurrency(totalPendingValue)}
                  </Badge>
                )}
              </div>
              <div className="flex items-center space-x-2">
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={refreshData}
                  disabled={isLoading}
                >
                  <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
                  Atualizar
                </Button>
                {selectedOrderIds.length > 0 && (
                  <>
                    <Button 
                      variant="destructive" 
                      size="sm" 
                      onClick={rejectSelectedOrders}
                      disabled={isImporting}
                    >
                      <X className="h-4 w-4 mr-2" />
                      Rejeitar ({selectedOrderIds.length})
                    </Button>
                    <Button 
                      size="sm" 
                      onClick={importSelectedOrders}
                      disabled={isImporting}
                      className="bg-green-600 hover:bg-green-700"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      {isImporting ? 'Importando...' : `Importar (${selectedOrderIds.length})`}
                    </Button>
                  </>
                )}
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Tabs */}
        <Tabs defaultValue="pending" className="space-y-4">
          <TabsList>
            <TabsTrigger value="pending" className="flex items-center space-x-2">
              <Smartphone className="h-4 w-4" />
              <span>Pedidos Pendentes</span>
              {pendingOrders.length > 0 && (
                <Badge variant="secondary" className="ml-2">
                  {pendingOrders.length}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="history" className="flex items-center space-x-2">
              <History className="h-4 w-4" />
              <span>Histórico</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="pending" className="space-y-4">
            {isLoading ? (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p>Carregando pedidos pendentes...</p>
                  </div>
                </CardContent>
              </Card>
            ) : salesRepSections.length > 0 ? (
              <div className="space-y-6">
                {salesRepSections.map(({ salesRepId, salesRepName, orders }) => (
                  <SalesRepSection
                    key={salesRepId}
                    salesRepName={salesRepName}
                    orders={orders}
                    selectedOrderIds={selectedOrderIds}
                    onToggleOrderSelection={toggleOrderSelection}
                    onSelectAllFromSalesRep={() => selectAllOrdersFromSalesRep(salesRepId)}
                  />
                ))}
              </div>
            ) : (
              <Card>
                <CardContent className="py-8">
                  <div className="text-center text-muted-foreground">
                    <Smartphone className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p className="text-lg font-medium mb-2">Nenhum pedido pendente</p>
                    <p>Todos os pedidos mobile foram importados ou não há pedidos para importar.</p>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>

          <TabsContent value="history">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <History className="h-5 w-5" />
                  <span>Histórico de Importações</span>
                  <Badge variant="outline">
                    {importHistory.length} registros
                  </Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ImportHistoryTable orders={importHistory} />
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </PageLayout>
  );
}
