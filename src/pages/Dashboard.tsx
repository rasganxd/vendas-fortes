
import { useEffect, useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import PageLayout from '@/components/layout/PageLayout';
import DashboardCard from '@/components/dashboard/DashboardCard';
import SalesChart from '@/components/dashboard/SalesChart';
import RecentOrdersTable from '@/components/dashboard/RecentOrdersTable';
import { Users, Package, ShoppingCart, DollarSign, TrendingUp, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

export default function Dashboard() {
  const { customers, products, orders, payments } = useAppContext();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 60000); // Update every minute
    
    return () => clearInterval(timer);
  }, []);
  
  // Calculate total sales amount
  const totalSales = orders.reduce((total, order) => total + order.total, 0);
  
  // Calculate total payments received
  const totalPayments = payments
    .filter(payment => payment.status === 'completed')
    .reduce((total, payment) => total + payment.amount, 0);
  
  // Count confirmed orders
  const confirmedOrders = orders.filter(order => order.status === 'confirmed').length;
  
  // Calculate pending payments amount
  const pendingPayments = totalSales - totalPayments;
  
  // Get low stock products
  const lowStockProducts = products
    .filter(product => product.stock < 100)
    .sort((a, b) => a.stock - b.stock);
  
  // Get recent orders
  const recentOrders = [...orders]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5);

  // Format today's date
  const formattedDate = format(currentTime, "EEEE, d 'de' MMMM", { locale: ptBR });
  const capitalizedDate = formattedDate.charAt(0).toUpperCase() + formattedDate.slice(1);
  
  return (
    <PageLayout title="Dashboard">
      <div className="mb-6">
        <h2 className="text-xl text-gray-500 font-medium">
          Bem-vindo ao SalesTrack
        </h2>
        <p className="text-sm text-gray-500">
          {capitalizedDate} • {currentTime.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
        </p>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total de Vendas"
          value={totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={<DollarSign size={20} />}
          trend={{ value: 12.5, isPositive: true }}
          valueClassName="text-blue-600"
          className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200"
        />
        <DashboardCard
          title="Pagamentos Recebidos"
          value={totalPayments.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={<TrendingUp size={20} />}
          trend={{ value: 8.2, isPositive: true }}
          valueClassName="text-green-600"
          className="bg-gradient-to-br from-green-50 to-green-100 border-green-200"
        />
        <DashboardCard
          title="Clientes Ativos"
          value={customers.length}
          icon={<Users size={20} />}
          trend={{ value: 4.1, isPositive: true }}
          valueClassName="text-purple-600"
          className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200"
        />
        <DashboardCard
          title="Pedidos Pendentes"
          value={confirmedOrders}
          icon={<ShoppingCart size={20} />}
          trend={{ value: 1.5, isPositive: false }}
          valueClassName="text-amber-600"
          className="bg-gradient-to-br from-amber-50 to-amber-100 border-amber-200"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <SalesChart title="Desempenho de Vendas" className="lg:col-span-2" />
        
        <Card className="border border-red-100 shadow-sm">
          <CardHeader className="pb-3">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg font-semibold">Produtos em Baixo Estoque</CardTitle>
              <Badge variant="destructive" className="gap-1">
                <AlertTriangle size={12} />
                <span>{lowStockProducts.length}</span>
              </Badge>
            </div>
            <CardDescription>Produtos que precisam de reposição</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            {lowStockProducts.length > 0 ? (
              <ul className="space-y-3">
                {lowStockProducts.slice(0, 5).map(product => (
                  <li key={product.id} className="flex items-center justify-between p-2 rounded-md bg-red-50/50">
                    <div>
                      <p className="font-medium text-gray-700">{product.name}</p>
                      <p className="text-xs text-gray-500">{product.code}</p>
                    </div>
                    <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                      product.stock < 50 ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-700'
                    }`}>
                      {product.stock} {product.unit}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <div className="flex items-center justify-center h-32 text-gray-500">
                Nenhum produto com estoque baixo
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <Card className="lg:col-span-2 border border-blue-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Pedidos Recentes</CardTitle>
            <CardDescription>Últimos pedidos registrados</CardDescription>
          </CardHeader>
          <CardContent>
            <RecentOrdersTable orders={recentOrders} />
          </CardContent>
        </Card>

        <Card className="border border-green-100 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-semibold">Situação Financeira</CardTitle>
            <CardDescription>Resumo dos valores</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="bg-green-50 p-3 rounded-md">
                <div className="text-sm text-gray-500">Recebido</div>
                <div className="text-xl font-bold text-green-600">
                  {totalPayments.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              
              <div className="bg-amber-50 p-3 rounded-md">
                <div className="text-sm text-gray-500">Pendente</div>
                <div className="text-xl font-bold text-amber-600">
                  {pendingPayments.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
              
              <div className="bg-blue-50 p-3 rounded-md">
                <div className="text-sm text-gray-500">Total</div>
                <div className="text-xl font-bold text-blue-600">
                  {totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageLayout>
  );
}
