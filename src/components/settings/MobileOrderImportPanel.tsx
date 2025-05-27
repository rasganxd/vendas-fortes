
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertCircle, CheckCircle, Download, Trash2, RefreshCw, Eye, X } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { mobileOrderImportService, ImportLog } from '@/services/supabase/mobileOrderImportService';
import { Order } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';

export default function MobileOrderImportPanel() {
  const [importLogs, setImportLogs] = useState<ImportLog[]>([]);
  const [mobileOrders, setMobileOrders] = useState<Order[]>([]);
  const [importStats, setImportStats] = useState({
    totalImported: 0,
    todayImported: 0,
    failedImports: 0,
    lastImport: undefined as Date | undefined
  });
  const [isLoading, setIsLoading] = useState(false);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    try {
      const [logs, orders, stats] = await Promise.all([
        mobileOrderImportService.getImportLogs(),
        mobileOrderImportService.getMobileOrders(),
        mobileOrderImportService.getImportStats()
      ]);

      setImportLogs(logs);
      setMobileOrders(orders);
      setImportStats(stats);
    } catch (error) {
      console.error('Error loading import data:', error);
      toast({
        title: "Erro ao carregar dados",
        description: "Não foi possível carregar os dados de importação.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveOrder = async (orderId: string) => {
    try {
      await mobileOrderImportService.approveOrder(orderId);
      toast({
        title: "Pedido aprovado",
        description: "O pedido foi aprovado com sucesso."
      });
      loadData();
    } catch (error) {
      toast({
        title: "Erro ao aprovar pedido",
        description: "Não foi possível aprovar o pedido.",
        variant: "destructive"
      });
    }
  };

  const handleRejectOrder = async (orderId: string) => {
    try {
      await mobileOrderImportService.rejectOrder(orderId);
      toast({
        title: "Pedido rejeitado",
        description: "O pedido foi rejeitado e removido."
      });
      loadData();
    } catch (error) {
      toast({
        title: "Erro ao rejeitar pedido",
        description: "Não foi possível rejeitar o pedido.",
        variant: "destructive"
      });
    }
  };

  const handleClearLogs = async () => {
    try {
      await mobileOrderImportService.clearImportLogs();
      toast({
        title: "Logs limpos",
        description: "Todos os logs de importação foram removidos."
      });
      loadData();
    } catch (error) {
      toast({
        title: "Erro ao limpar logs",
        description: "Não foi possível limpar os logs.",
        variant: "destructive"
      });
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'completed':
        return <Badge className="bg-green-500"><CheckCircle className="w-3 h-3 mr-1" />Sucesso</Badge>;
      case 'failed':
        return <Badge variant="destructive"><AlertCircle className="w-3 h-3 mr-1" />Falha</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getEventTypeBadge = (eventType: string) => {
    switch (eventType) {
      case 'upload':
        return <Badge variant="outline"><Download className="w-3 h-3 mr-1" />Upload</Badge>;
      case 'error':
        return <Badge variant="destructive"><X className="w-3 h-3 mr-1" />Erro</Badge>;
      default:
        return <Badge variant="secondary">{eventType}</Badge>;
    }
  };

  const getOrderStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-100 text-yellow-800">Pendente</Badge>;
      case 'confirmed':
        return <Badge className="bg-blue-500">Confirmado</Badge>;
      case 'approved':
        return <Badge className="bg-green-500">Aprovado</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  return (
    <div className="space-y-6">
      {/* Statistics Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Importado</p>
                <p className="text-2xl font-bold text-green-600">{importStats.totalImported}</p>
              </div>
              <CheckCircle className="h-8 w-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Hoje</p>
                <p className="text-2xl font-bold text-blue-600">{importStats.todayImported}</p>
              </div>
              <Download className="h-8 w-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Falhas</p>
                <p className="text-2xl font-bold text-red-600">{importStats.failedImports}</p>
              </div>
              <AlertCircle className="h-8 w-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Última Importação</p>
                <p className="text-sm font-bold text-gray-800">
                  {importStats.lastImport ? formatDateToBR(importStats.lastImport) : 'Nunca'}
                </p>
              </div>
              <RefreshCw className="h-8 w-8 text-gray-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="orders" className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList>
            <TabsTrigger value="orders">Pedidos Importados</TabsTrigger>
            <TabsTrigger value="logs">Logs de Importação</TabsTrigger>
          </TabsList>
          
          <div className="flex gap-2">
            <Button onClick={loadData} variant="outline" disabled={isLoading}>
              <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
              Atualizar
            </Button>
          </div>
        </div>

        <TabsContent value="orders">
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Importados do Mobile</CardTitle>
            </CardHeader>
            <CardContent>
              {mobileOrders.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum pedido importado do mobile encontrado.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Código</TableHead>
                      <TableHead>Cliente</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Total</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {mobileOrders.map((order) => (
                      <TableRow key={order.id}>
                        <TableCell className="font-medium">#{order.code}</TableCell>
                        <TableCell>{order.customerName}</TableCell>
                        <TableCell>{order.salesRepName}</TableCell>
                        <TableCell>R$ {order.total.toFixed(2)}</TableCell>
                        <TableCell>{getOrderStatusBadge(order.status)}</TableCell>
                        <TableCell>{formatDateToBR(order.createdAt)}</TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setSelectedOrder(order)}
                            >
                              <Eye className="h-3 w-3" />
                            </Button>
                            {order.status === 'pending' && (
                              <>
                                <Button
                                  size="sm"
                                  className="bg-green-500 hover:bg-green-600"
                                  onClick={() => handleApproveOrder(order.id)}
                                >
                                  <CheckCircle className="h-3 w-3" />
                                </Button>
                                <Button
                                  size="sm"
                                  variant="destructive"
                                  onClick={() => handleRejectOrder(order.id)}
                                >
                                  <X className="h-3 w-3" />
                                </Button>
                              </>
                            )}
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle>Logs de Importação</CardTitle>
                <Button onClick={handleClearLogs} variant="outline" size="sm">
                  <Trash2 className="h-4 w-4 mr-2" />
                  Limpar Logs
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              {importLogs.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-500">Nenhum log de importação encontrado.</p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Data/Hora</TableHead>
                      <TableHead>Tipo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Registros</TableHead>
                      <TableHead>Vendedor</TableHead>
                      <TableHead>Erro</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {importLogs.map((log) => (
                      <TableRow key={log.id}>
                        <TableCell>{formatDateToBR(new Date(log.created_at))}</TableCell>
                        <TableCell>{getEventTypeBadge(log.event_type)}</TableCell>
                        <TableCell>{getStatusBadge(log.status)}</TableCell>
                        <TableCell>{log.records_count || 0}</TableCell>
                        <TableCell className="text-sm">
                          {log.sales_rep_id ? log.sales_rep_id.substring(0, 8) + '...' : '-'}
                        </TableCell>
                        <TableCell className="text-sm text-red-600">
                          {log.error_message && (
                            <span title={log.error_message}>
                              {log.error_message.length > 50 
                                ? log.error_message.substring(0, 50) + '...'
                                : log.error_message
                              }
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Order Detail Modal */}
      {selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">Detalhes do Pedido #{selectedOrder.code}</h2>
              <Button variant="outline" onClick={() => setSelectedOrder(null)}>
                <X className="h-4 w-4" />
              </Button>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <p><strong>Cliente:</strong> {selectedOrder.customerName}</p>
                <p><strong>Vendedor:</strong> {selectedOrder.salesRepName}</p>
                <p><strong>Status:</strong> {getOrderStatusBadge(selectedOrder.status)}</p>
              </div>
              <div>
                <p><strong>Total:</strong> R$ {selectedOrder.total.toFixed(2)}</p>
                <p><strong>Data:</strong> {formatDateToBR(selectedOrder.createdAt)}</p>
                <p><strong>Pagamento:</strong> {selectedOrder.paymentMethod}</p>
              </div>
            </div>

            <div>
              <h3 className="font-bold mb-2">Itens do Pedido</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                    <TableHead>Preço Unit.</TableHead>
                    <TableHead>Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrder.items.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                      <TableCell>R$ {item.unitPrice.toFixed(2)}</TableCell>
                      <TableCell>R$ {item.total.toFixed(2)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
