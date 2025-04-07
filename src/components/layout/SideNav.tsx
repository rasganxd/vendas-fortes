
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import {
  LayoutDashboard,
  Users,
  Package,
  ShoppingCart,
  CreditCard,
  MapPin,
  Truck,
  User,
  Wallet,
  Settings
} from 'lucide-react';

const menuItems = [
  {
    title: 'Dashboard',
    href: '/',
    icon: <LayoutDashboard className="h-5 w-5" />
  },
  {
    title: 'Clientes',
    href: '/clientes',
    icon: <Users className="h-5 w-5" />
  },
  {
    title: 'Produtos',
    href: '/produtos',
    icon: <Package className="h-5 w-5" />
  },
  {
    title: 'Pedidos',
    href: '/pedidos',
    icon: <ShoppingCart className="h-5 w-5" />
  },
  {
    title: 'Pagamentos',
    href: '/pagamentos',
    icon: <CreditCard className="h-5 w-5" />
  },
  {
    title: 'Rotas',
    href: '/rotas',
    icon: <MapPin className="h-5 w-5" />
  },
  {
    title: 'Cargas',
    href: '/cargas',
    icon: <Truck className="h-5 w-5" />
  },
  {
    title: 'Vendedores',
    href: '/vendedores',
    icon: <User className="h-5 w-5" />
  },
  {
    title: 'Formas Pagamento',
    href: '/formas-pagamento',
    icon: <Wallet className="h-5 w-5" />
  },
  {
    title: 'Manutenção',
    href: '/manutencao',
    icon: <Settings className="h-5 w-5" />
  }
];

interface SideNavProps {
  isCollapsed?: boolean;
}

const SideNav = ({ isCollapsed = false }: SideNavProps) => {
  const { pathname } = useLocation();

  return (
    <div
      className={cn(
        "flex flex-col gap-2 py-2 h-full bg-background",
        isCollapsed ? "items-center" : "px-2"
      )}
    >
      {menuItems.map((item, index) => (
        <Button
          key={index}
          variant={pathname === item.href ? "secondary" : "ghost"}
          className={cn(
            "w-full",
            isCollapsed ? "justify-center px-0" : "justify-start",
            "h-10"
          )}
          asChild
        >
          <Link to={item.href}>
            {item.icon}
            {!isCollapsed && <span className="ml-2">{item.title}</span>}
          </Link>
        </Button>
      ))}
    </div>
  );
};

export default SideNav;
