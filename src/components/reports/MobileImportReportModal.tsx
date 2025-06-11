
import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Download, FileText, Users, ShoppingCart, DollarSign } from 'lucide-react';
import { ImportReportData } from '@/services/mobileImportReportService';

interface MobileImportReportModalProps {
  report: ImportReportData | null;
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileImportReportModal({ 
  report, 
  isOpen, 
  onClose 
}: MobileImportReportModalProps) {
  if (!report) return null;

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value);
  };

  const downloadReport = () => {
    const content = generateTextReport(report);
    const blob = new Blob([content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `relatorio-${report.operationType}-${report.timestamp.toISOString().split('T')[0]}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const generateTextReport = (report: ImportReportData): string => {
    const sections = [
      `RELATÓRIO DE ${report.operationType.toUpperCase()} DE PEDIDOS MOBILE`,
      `Gerado em: ${report.timestamp.toLocaleString('pt-BR')}`,
      `Operador: ${report.operator}`,
      '',
      '=== RESUMO EXECUTIVO ===',
      `Total de Pedidos: ${report.summary.totalOrders}`,
      `Valor Total: ${formatCurrency(report.summary.totalValue)}`,
      `Vendedores Envolvidos: ${report.summary.salesRepsCount}`,
      `Total de Itens: ${report.summary.totalItems}`,
      '',
      '=== DETALHAMENTO POR VENDEDOR ===',
      ...report.salesRepBreakdown.map(rep => [
        `${rep.salesRepName} (${rep.ordersCount} pedidos - ${formatCurrency(rep.totalValue)})`,
        ...rep.orders.map(order => 
          `  • Pedido #${order.code || 'S/N'} - ${order.customerName} - ${formatCurrency(order.total)} (${order.itemsCount} itens)${order.rejectionReason ? ` [Rejeitado: ${order.rejectionReason}]` : ''}`
        ),
        ''
      ]).flat()
    ];

    if (report.topProducts.length > 0) {
      sections.push(
        '=== PRODUTOS MAIS VENDIDOS ===',
        ...report.topProducts.map((product, index) => 
          `${index + 1}. ${product.productName} (Cód: ${product.productCode}) - Qtd: ${product.totalQuantity} (${product.occurrences} pedidos)`
        )
      );
    }

    if (report.notes) {
      sections.push('', '=== OBSERVAÇÕES ===', report.notes);
    }

    return sections.join('\n');
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Relatório de {report.operationType === 'import' ? 'Importação' : 'Rejeição'} de Pedidos Mobile
          </DialogTitle>
          <div className="text-sm text-muted-foreground">
            Gerado em {report.timestamp.toLocaleString('pt-BR')} por {report.operator}
          </div>
        </DialogHeader>

        <div className="space-y-6">
          {/* Resumo Executivo */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <ShoppingCart className="h-4 w-4 text-blue-500" />
                  <div>
                    <div className="text-2xl font-bold">{report.summary.totalOrders}</div>
                    <div className="text-sm text-muted-foreground">Pedidos</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4 text-green-500" />
                  <div>
                    <div className="text-lg font-bold">{formatCurrency(report.summary.totalValue)}</div>
                    <div className="text-sm text-muted-foreground">Valor Total</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-purple-500" />
                  <div>
                    <div className="text-2xl font-bold">{report.summary.salesRepsCount}</div>
                    <div className="text-sm text-muted-foreground">Vendedores</div>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <FileText className="h-4 w-4 text-orange-500" />
                  <div>
                    <div className="text-2xl font-bold">{report.summary.totalItems}</div>
                    <div className="text-sm text-muted-foreground">Itens</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Detalhamento por Vendedor */}
          <Card>
            <CardHeader>
              <CardTitle>Detalhamento por Vendedor</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {report.salesRepBreakdown.map((rep, index) => (
                <div key={rep.salesRepId} className="border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <h4 className="font-semibold">{rep.salesRepName}</h4>
                      <div className="text-sm text-muted-foreground">
                        {rep.ordersCount} pedidos • {formatCurrency(rep.totalValue)}
                      </div>
                    </div>
                    <Badge variant="secondary">
                      {((rep.totalValue / report.summary.totalValue) * 100).toFixed(1)}%
                    </Badge>
                  </div>
                  
                  <div className="space-y-2">
                    {rep.orders.map((order) => (
                      <div key={order.id} className="flex items-center justify-between py-2 px-3 bg-muted/50 rounded">
                        <div className="flex-1">
                          <span className="font-medium">Pedido #{order.code || 'S/N'}</span>
                          <span className="mx-2">•</span>
                          <span>{order.customerName}</span>
                          {order.rejectionReason && (
                            <Badge variant="destructive" className="ml-2 text-xs">
                              {order.rejectionReason}
                            </Badge>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="font-medium">{formatCurrency(order.total)}</div>
                          <div className="text-xs text-muted-foreground">{order.itemsCount} itens</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          {/* Produtos Mais Vendidos */}
          {report.topProducts.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {report.topProducts.map((product, index) => (
                    <div key={`${product.productCode}-${product.productName}`} className="flex items-center justify-between py-2">
                      <div className="flex items-center gap-3">
                        <Badge variant="outline">{index + 1}</Badge>
                        <div>
                          <div className="font-medium">{product.productName}</div>
                          <div className="text-sm text-muted-foreground">Código: {product.productCode}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-medium">Qtd: {product.totalQuantity}</div>
                        <div className="text-xs text-muted-foreground">{product.occurrences} pedidos</div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Observações */}
          {report.notes && (
            <Card>
              <CardHeader>
                <CardTitle>Observações</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{report.notes}</p>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={downloadReport}>
            <Download className="h-4 w-4 mr-2" />
            Baixar Relatório
          </Button>
          <Button onClick={onClose}>Fechar</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
