
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { SalesRepPerformance, TopProduct } from '@/types/reports';
import { formatCurrency, formatNumber } from '@/lib/format-utils';

interface ProductsBySalesRepProps {
  salesRepPerformance: SalesRepPerformance[];
  topProducts: TopProduct[];
}

export const ProductsBySalesRep: React.FC<ProductsBySalesRepProps> = ({ 
  salesRepPerformance, 
  topProducts 
}) => {
  return (
    <div className="space-y-6">
      {/* Top Produtos Geral */}
      <Card>
        <CardHeader>
          <CardTitle>Top 10 Produtos Mais Vendidos</CardTitle>
          <p className="text-sm text-gray-600">
            Ranking dos produtos por receita no período selecionado
          </p>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Posição</TableHead>
                  <TableHead>Produto</TableHead>
                  <TableHead>Código</TableHead>
                  <TableHead>Quantidade</TableHead>
                  <TableHead>Receita</TableHead>
                  <TableHead>Pedidos</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((product, index) => (
                  <TableRow key={product.id}>
                    <TableCell>
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-white ${
                        index === 0 ? 'bg-yellow-500' : 
                        index === 1 ? 'bg-gray-400' : 
                        index === 2 ? 'bg-orange-500' : 'bg-blue-500'
                      }`}>
                        {index + 1}
                      </div>
                    </TableCell>
                    <TableCell className="font-medium">{product.name}</TableCell>
                    <TableCell>#{product.code}</TableCell>
                    <TableCell>{formatNumber(product.totalQuantity)}</TableCell>
                    <TableCell className="font-semibold">{formatCurrency(product.totalRevenue)}</TableCell>
                    <TableCell>{formatNumber(product.ordersCount)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>

          {topProducts.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum produto vendido no período selecionado
            </div>
          )}
        </CardContent>
      </Card>

      {/* Performance por Vendedor */}
      <Card>
        <CardHeader>
          <CardTitle>Análise por Vendedor</CardTitle>
          <p className="text-sm text-gray-600">
            Performance detalhada e produtos vendidos por cada vendedor
          </p>
        </CardHeader>
        <CardContent>
          <Accordion type="single" collapsible className="space-y-2">
            {salesRepPerformance.map((rep) => (
              <AccordionItem key={rep.salesRepId} value={rep.salesRepId} className="border rounded-lg">
                <AccordionTrigger className="px-4 py-3 hover:no-underline">
                  <div className="flex items-center justify-between w-full pr-4">
                    <div className="flex items-center gap-4">
                      <div className="text-left">
                        <div className="font-semibold">{rep.salesRepName}</div>
                        <div className="text-sm text-gray-600">
                          {formatNumber(rep.ordersCount)} pedidos • {formatNumber(rep.productsCount)} produtos
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-bold text-lg">{formatCurrency(rep.totalRevenue)}</div>
                      <div className="text-sm text-gray-600">Ticket: {formatCurrency(rep.averageOrderValue)}</div>
                    </div>
                  </div>
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="bg-blue-50 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-blue-600">{formatCurrency(rep.totalRevenue)}</div>
                        <div className="text-xs text-gray-600">Receita Total</div>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-green-600">{formatNumber(rep.ordersCount)}</div>
                        <div className="text-xs text-gray-600">Pedidos</div>
                      </div>
                      <div className="bg-purple-50 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-purple-600">{formatCurrency(rep.averageOrderValue)}</div>
                        <div className="text-xs text-gray-600">Ticket Médio</div>
                      </div>
                      <div className="bg-orange-50 p-3 rounded-lg text-center">
                        <div className="text-xl font-bold text-orange-600">{formatNumber(rep.productsCount)}</div>
                        <div className="text-xs text-gray-600">Produtos</div>
                      </div>
                    </div>
                  </div>
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>

          {salesRepPerformance.length === 0 && (
            <div className="text-center py-8 text-gray-500">
              Nenhum vendedor encontrado no período selecionado
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};
