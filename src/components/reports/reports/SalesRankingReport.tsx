
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Trophy, TrendingUp, Target, Award } from 'lucide-react';
import { ReportFilters, ReportsData } from '@/types/reports';
import { formatCurrency } from '@/lib/format-utils';

interface SalesRankingReportProps {
  data: ReportsData;
  filters: ReportFilters;
}

const SalesRankingReport: React.FC<SalesRankingReportProps> = ({ data, filters }) => {
  console.log('📊 [SalesRankingReport] Rendering with data:', data);

  const salesReps = data.salesRepPerformance || [];
  const maxRevenue = Math.max(...salesReps.map(rep => rep.totalRevenue), 1);

  const podiumReps = salesReps.slice(0, 3);
  const otherReps = salesReps.slice(3);

  return (
    <div className="space-y-6 p-6">
      {/* Pódio dos Top 3 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Trophy className="h-5 w-5 text-yellow-500" />
            Pódio dos Melhores Vendedores
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {podiumReps.map((rep, index) => {
              const position = index + 1;
              const icons = [Trophy, Award, Award];
              const colors = ['text-yellow-500', 'text-gray-400', 'text-orange-600'];
              const bgColors = ['bg-yellow-50', 'bg-gray-50', 'bg-orange-50'];
              const Icon = icons[index];
              
              return (
                <Card key={rep.id} className={`${bgColors[index]} border-2`}>
                  <CardContent className="p-6 text-center">
                    <div className="flex justify-center mb-4">
                      <Icon className={`h-12 w-12 ${colors[index]}`} />
                    </div>
                    <div className="text-2xl font-bold mb-1">#{position}</div>
                    <h3 className="text-lg font-semibold mb-2">{rep.name}</h3>
                    <div className="space-y-2">
                      <div>
                        <p className="text-2xl font-bold text-green-600">
                          {formatCurrency(rep.totalRevenue)}
                        </p>
                        <p className="text-sm text-muted-foreground">Receita Total</p>
                      </div>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <p className="font-medium">{rep.totalOrders}</p>
                          <p className="text-muted-foreground">Pedidos</p>
                        </div>
                        <div>
                          <p className="font-medium">{formatCurrency(rep.averageTicket)}</p>
                          <p className="text-muted-foreground">Ticket Médio</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Ranking Completo */}
      <Card>
        <CardHeader>
          <CardTitle>Ranking Completo de Vendedores</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {salesReps.map((rep, index) => {
              const position = index + 1;
              const progressPercentage = (rep.totalRevenue / maxRevenue) * 100;
              
              return (
                <div key={rep.id} className="p-4 border rounded-lg">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-white font-bold ${
                        position <= 3 ? 'bg-gradient-to-r from-yellow-400 to-yellow-600' :
                        position <= 5 ? 'bg-gradient-to-r from-blue-400 to-blue-600' :
                        'bg-gradient-to-r from-gray-400 to-gray-600'
                      }`}>
                        {position}
                      </div>
                      <div>
                        <h4 className="font-semibold text-lg">{rep.name}</h4>
                        <div className="flex gap-2">
                          <Badge variant="outline">
                            {rep.totalOrders} pedidos
                          </Badge>
                          <Badge variant="outline">
                            {rep.activeCustomers} clientes
                          </Badge>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-green-600">
                        {formatCurrency(rep.totalRevenue)}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Ticket médio: {formatCurrency(rep.averageTicket)}
                      </p>
                    </div>
                  </div>
                  
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>Performance vs líder</span>
                      <span>{progressPercentage.toFixed(1)}%</span>
                    </div>
                    <Progress value={progressPercentage} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4 text-sm">
                    <div className="text-center">
                      <p className="font-medium text-blue-600">{rep.conversionRate?.toFixed(1)}%</p>
                      <p className="text-muted-foreground">Taxa Conversão</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-purple-600">{rep.totalProducts}</p>
                      <p className="text-muted-foreground">Produtos Vendidos</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-orange-600">{rep.averageOrderValue?.toFixed(0)}</p>
                      <p className="text-muted-foreground">Itens/Pedido</p>
                    </div>
                    <div className="text-center">
                      <p className="font-medium text-green-600">{rep.growthRate?.toFixed(1)}%</p>
                      <p className="text-muted-foreground">Crescimento</p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Estatísticas Gerais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 text-green-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {salesReps.length > 0 ? 
                (salesReps.reduce((sum, rep) => sum + rep.totalRevenue, 0) / salesReps.length).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })
                : 'R$ 0,00'
              }
            </p>
            <p className="text-sm text-muted-foreground">Receita Média por Vendedor</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Target className="h-8 w-8 text-blue-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {salesReps.length > 0 ? 
                Math.round(salesReps.reduce((sum, rep) => sum + rep.totalOrders, 0) / salesReps.length)
                : 0
              }
            </p>
            <p className="text-sm text-muted-foreground">Pedidos Médios por Vendedor</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Award className="h-8 w-8 text-purple-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {salesReps.length > 0 ? 
                Math.round(salesReps.reduce((sum, rep) => sum + rep.activeCustomers, 0) / salesReps.length)
                : 0
              }
            </p>
            <p className="text-sm text-muted-foreground">Clientes Médios por Vendedor</p>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4 text-center">
            <Trophy className="h-8 w-8 text-yellow-500 mx-auto mb-2" />
            <p className="text-2xl font-bold">
              {salesReps.length > 0 ? 
                salesReps.reduce((sum, rep) => sum + rep.conversionRate, 0) / salesReps.length
                : 0
              }%
            </p>
            <p className="text-sm text-muted-foreground">Taxa de Conversão Média</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default SalesRankingReport;
