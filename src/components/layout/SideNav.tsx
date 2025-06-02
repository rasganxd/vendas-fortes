
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  ShoppingCart,
  Users,
  UserCheck,
  CreditCard,
  Calculator,
  Ruler,
  Truck,
  MapPin,
  Package,
  Receipt,
  BarChart3,
  Settings,
  RefreshCw,
  Box
} from 'lucide-react';

const navigation = [
  { name: 'Dashboard', href: '/dashboard', icon: LayoutDashboard },
  { name: 'Pedidos', href: '/pedidos', icon: ShoppingCart },
  { name: 'Clientes', href: '/clientes', icon: Users },
  { name: 'Produtos', href: '/produtos', icon: Box },
  { name: 'Vendedores', href: '/vendedores', icon: UserCheck },
  { name: 'Métodos de Pagamento', href: '/metodos-pagamento', icon: CreditCard },
  { name: 'Tabelas de Pagamento', href: '/tabelas-pagamento', icon: Calculator },
  { name: 'Unidades de Medida', href: '/unidades', icon: Ruler },
  { name: 'Veículos', href: '/veiculos', icon: Truck },
  { name: 'Rotas de Entrega', href: '/rotas-entrega', icon: MapPin },
  { name: 'Cargas', href: '/cargas', icon: Package },
  { name: 'Pagamentos', href: '/pagamentos', icon: Receipt },
  { name: 'Relatórios', href: '/relatorios', icon: BarChart3 },
  { name: 'Configurações', href: '/configuracoes', icon: Settings },
  { name: 'Sincronização', href: '/sincronizacao', icon: RefreshCw },
];

export default function SideNav() {
  const location = useLocation();

  return (
    <nav className="flex-1 space-y-1 px-2 py-4">
      {navigation.map((item) => {
        const isActive = location.pathname === item.href;
        return (
          <Link
            key={item.name}
            to={item.href}
            className={cn(
              'group flex items-center px-2 py-2 text-sm font-medium rounded-md transition-colors',
              isActive
                ? 'bg-blue-100 text-blue-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            )}
          >
            <item.icon
              className={cn(
                'mr-3 h-5 w-5 flex-shrink-0',
                isActive ? 'text-blue-500' : 'text-gray-400'
              )}
            />
            {item.name}
          </Link>
        );
      })}
    </nav>
  );
}
