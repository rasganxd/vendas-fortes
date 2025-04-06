
import { useEffect, useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import PageLayout from '@/components/layout/PageLayout';
import DashboardCard from '@/components/dashboard/DashboardCard';
import SalesChart from '@/components/dashboard/SalesChart';
import RecentOrdersTable from '@/components/dashboard/RecentOrdersTable';
import { Users, PackageSearch, ShoppingCart, DollarSign, TrendingUp } from 'lucide-react';

export default function Dashboard() {
  const { customers, products, orders, payments } = useAppContext();
  
  // Calculate total sales amount
  const totalSales = orders.reduce((total, order) => total + order.total, 0);
  
  // Calculate total payments received
  const totalPayments = payments
    .filter(payment => payment.status === 'completed')
    .reduce((total, payment) => total + payment.amount, 0);
  
  // Count confirmed orders
  const confirmedOrders = orders.filter(order => order.status === 'confirmed').length;
  
  return (
    <PageLayout title="Dashboard">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <DashboardCard
          title="Total de Vendas"
          value={totalSales.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={<DollarSign size={20} />}
          trend={{ value: 12.5, isPositive: true }}
          valueClassName="text-sales-800"
        />
        <DashboardCard
          title="Pagamentos Recebidos"
          value={totalPayments.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
          icon={<TrendingUp size={20} />}
          trend={{ value: 8.2, isPositive: true }}
          valueClassName="text-teal-600"
        />
        <DashboardCard
          title="Clientes Ativos"
          value={customers.length}
          icon={<Users size={20} />}
          trend={{ value: 4.1, isPositive: true }}
        />
        <DashboardCard
          title="Pedidos Pendentes"
          value={confirmedOrders}
          icon={<ShoppingCart size={20} />}
          trend={{ value: 1.5, isPositive: false }}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        <SalesChart title="Vendas vs. Entregas" className="lg:col-span-2" />
        
        <div className="bg-white rounded-lg shadow p-6 border border-gray-100">
          <h2 className="text-lg font-semibold mb-4">Produtos em Baixo Estoque</h2>
          <ul className="space-y-4">
            {products
              .filter(product => product.stock < 100)
              .slice(0, 5)
              .map(product => (
                <li key={product.id} className="flex items-center justify-between">
                  <span className="font-medium">{product.name}</span>
                  <span className={`font-semibold ${
                    product.stock < 50 ? 'text-red-600' : 'text-yellow-600'
                  }`}>
                    {product.stock} {product.unit}
                  </span>
                </li>
              ))}
          </ul>
        </div>
      </div>

      <RecentOrdersTable orders={orders} />
    </PageLayout>
  );
}
