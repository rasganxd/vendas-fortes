
import React, { useState } from 'react';
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { useNavigate, useLocation } from 'react-router-dom';
import {
  Home,
  ShoppingCart,
  Users,
  Package,
  DollarSign,
  CreditCard,
  UserCheck,
  Route,
  Truck,
  Settings,
  ChevronLeft,
  ChevronRight,
  BarChart3,
  Receipt,
  TrendingUp,
  Building2,
  PackageOpen,
  CarFront,
  Wrench
} from 'lucide-react';

const SideNav = () => {
  const [collapsed, setCollapsed] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const menuItems = [
    {
      title: 'Dashboard',
      icon: Home,
      path: '/dashboard',
      group: 'main'
    },
    {
      title: 'Pedidos',
      icon: ShoppingCart,
      path: '/pedidos',
      group: 'sales'
    },
    {
      title: 'Clientes',
      icon: Users,
      path: '/clientes',
      group: 'sales'
    },
    {
      title: 'Produtos',
      icon: Package,
      path: '/produtos',
      group: 'inventory'
    },
    {
      title: 'Preços',
      icon: DollarSign,
      path: '/produtos/precos',
      group: 'inventory'
    },
    {
      title: 'Classificações',
      icon: Building2,
      path: '/produtos/classificacoes',
      group: 'inventory'
    },
    {
      title: 'Vendedores',
      icon: UserCheck,
      path: '/vendedores',
      group: 'personnel'
    },
    {
      title: 'Métodos Pagamento',
      icon: CreditCard,
      path: '/metodos-pagamento',
      group: 'payments'
    },
    {
      title: 'Tabelas Pagamento',
      icon: Receipt,
      path: '/tabelas-pagamento',
      group: 'payments'
    },
    {
      title: 'Pagamentos',
      icon: DollarSign,
      path: '/pagamentos',
      group: 'payments'
    },
    {
      title: 'Relatórios Vendas',
      icon: TrendingUp,
      path: '/relatorios-vendas',
      group: 'reports'
    },
    {
      title: 'Rotas',
      icon: Route,
      path: '/rotas',
      group: 'logistics'
    },
    {
      title: 'Cargas',
      icon: PackageOpen,
      path: '/cargas',
      group: 'logistics'
    },
    {
      title: 'Veículos',
      icon: CarFront,
      path: '/veiculos',
      group: 'logistics'
    },
    {
      title: 'Configurações',
      icon: Settings,
      path: '/configuracoes',
      group: 'admin'
    },
    {
      title: 'Manutenção',
      icon: Wrench,
      path: '/manutencao',
      group: 'admin'
    }
  ];

  const groupLabels = {
    main: 'Principal',
    sales: 'Vendas',
    inventory: 'Estoque',
    personnel: 'Pessoal',
    payments: 'Pagamentos',
    reports: 'Relatórios',
    logistics: 'Logística',
    admin: 'Administração'
  };

  const groupedItems = menuItems.reduce((acc, item) => {
    if (!acc[item.group]) {
      acc[item.group] = [];
    }
    acc[item.group].push(item);
    return acc;
  }, {});

  return (
    <div className={cn(
      "h-screen bg-background border-r border-border transition-all duration-300 flex flex-col",
      collapsed ? "w-16" : "w-64"
    )}>
      {/* Header */}
      <div className="p-4 border-b border-border">
        <div className="flex items-center justify-between">
          {!collapsed && (
            <h1 className="text-lg font-semibold">Sistema Vendas</h1>
          )}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setCollapsed(!collapsed)}
            className="h-8 w-8 p-0"
          >
            {collapsed ? <ChevronRight className="h-4 w-4" /> : <ChevronLeft className="h-4 w-4" />}
          </Button>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="space-y-6">
          {Object.entries(groupedItems).map(([group, items]) => (
            <div key={group} className="space-y-1">
              {!collapsed && (
                <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider px-3 py-2">
                  {groupLabels[group]}
                </h2>
              )}
              <div className="space-y-1">
                {items.map((item) => {
                  const Icon = item.icon;
                  const isActive = location.pathname === item.path;
                  
                  return (
                    <Button
                      key={item.path}
                      variant={isActive ? "secondary" : "ghost"}
                      className={cn(
                        "w-full justify-start gap-3 h-10",
                        collapsed && "justify-center px-2",
                        isActive && "bg-accent text-accent-foreground"
                      )}
                      onClick={() => navigate(item.path)}
                    >
                      <Icon className="h-4 w-4 flex-shrink-0" />
                      {!collapsed && <span className="truncate">{item.title}</span>}
                    </Button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      </nav>
    </div>
  );
};

export { SideNav };
