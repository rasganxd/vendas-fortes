
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { ReportFilters, ReportsData } from '@/types/reports';
import { formatCurrency } from '@/lib/format-utils';

interface ProductsBySalesRepProps {
  data: ReportsData;
  filters: ReportFilters;
}

const ProductsBySalesRep: React.FC<ProductsBySalesRepProps> = ({ data, filters }) => {
  console.log('📊 [ProductsBySalesRep] Rendering with data:', data);

  // Agregar produtos por vendedor
  const productsBySalesRep = data.orders?.reduce((acc, order) => {
    const repId = order.salesRepId;
    const repName = order.salesRepName;
    
    if (!acc[repId]) {
      acc[repId] = {
        name: repName,
        products: {},
        totalRevenue: 0,
        totalQuantity: 0
      };
    }
    
    order.items?.forEach(item => {
      const productKey = `${item.productCode}_${item.productName}`;
      
      if (!acc[repId].products[productKey]) {
        acc[repId].products[productKey] = {
          name: item.productName,
          code: item.productCode,
          quantity: 0,
          revenue: 0,
          orders: new Set()
        };
      }
      
      acc[repId].products[productKey].quantity += item.quantity;
      acc[repId].products[productKey].revenue += item.total;
      acc[repId].products[productKey].orders.add(order.id);
      acc[repId].totalRevenue += item.total;
      acc[repId].totalQuantity += item.quantity;
    });
    
    return acc;
  }, {}) || {};

  return (
    <div className="space-y-6 p-6">
      {/* Resumo por Vendedor */}
      <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-6">
        {Object.entries(productsBySalesRep).map(([repId, repData]) => (
          <Card key={repId}>
            <CardHeader>
              <CardTitle className="text-lg">{repData.name}</CardTitle>
              <div className="flex gap-2">
                <Badge variant="outline">
                  {Object.keys(repData.products).length} produtos
                </Badge>
                <Badge variant="outline">
                  {repData.totalQuantity} unidades
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                <div className="text-2xl font-bold text-green-600">
                  {formatCurrency(repData.totalRevenue)}
                </div>
                
                <div className="space-y-2">
                  <h4 className="font-medium text-sm">Top 3 Produtos:</h4>
                  {Object.values(repData.products)
                    .sort((a, b) => b.revenue - a.revenue)
                    .slice(0, 3)
                    .map((product, index) => (
                      <div key={index} className="flex justify-between text-sm">
                        <span className="truncate mr-2">{product.name}</span>
                        <span className="font-medium text-green-600">
                          {formatCurrency(product.revenue)}
                        </span>
                      </div>
                    ))}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Tabela Detalhada */}
      <Card>
        <CardHeader>
          <CardTitle>Produtos Vendidos por Vendedor (Detalhado)</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Vendedor</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Código</TableHead>
                <TableHead className="text-right">Quantidade</TableHead>
                <TableHead className="text-right">Pedidos</TableHead>
                <TableHead className="text-right">Receita</TableHead>
                <TableHead className="text-right">Média/Pedido</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {Object.entries(productsBySalesRep).map(([repId, repData]) =>
                Object.values(repData.products)
                  .sort((a, b) => b.revenue - a.revenue)
                  .map((product, index) => (
                    <TableRow key={`${repId}_${index}`}>
                      <TableCell className="font-medium">{repData.name}</TableCell>
                      <TableCell>{product.name}</TableCell>
                      <TableCell>#{product.code}</TableCell>
                      <TableCell className="text-right">{product.quantity}</TableCell>
                      <TableCell className="text-right">{product.orders.size}</TableCell>
                      <TableCell className="text-right font-medium text-green-600">
                        {formatCurrency(product.revenue)}
                      </TableCell>
                      <TableCell className="text-right">
                        {formatCurrency(product.revenue / product.orders.size)}
                      </TableCell>
                    </TableRow>
                  ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Produtos Mais Vendidos (Geral) */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking Geral de Produtos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {data.topProducts?.slice(0, 10).map((product, index) => (
              <div key={product.id} className="flex items-center justify-between py-3 border-b">
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-white text-sm font-bold ${
                    index === 0 ? 'bg-yellow-500' : index === 1 ? 'bg-gray-400' : index === 2 ? 'bg-orange-600' : 'bg-blue-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium">{product.name}</p>
                    <p className="text-sm text-muted-foreground">
                      Código: #{product.code}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-bold text-green-600">{formatCurrency(product.totalRevenue)}</p>
                  <p className="text-sm text-muted-foreground">
                    {product.totalQuantity} unidades
                  </p>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default ProductsBySalesRep;
