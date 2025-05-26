
import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';
import { Button } from '@/components/ui/button';
import { 
  Sidebar, 
  SidebarContent, 
  SidebarGroup, 
  SidebarGroupContent, 
  SidebarGroupLabel, 
  SidebarMenu, 
  SidebarMenuButton, 
  SidebarMenuItem,
  SidebarHeader,
  SidebarFooter,
  SidebarSeparator
} from '@/components/ui/sidebar';
import {
  Home,
  Users,
  Package,
  ShoppingCart,
  Truck,
  Route,
  UserCheck,
  Car,
  CreditCard,
  DollarSign,
  List,
  Settings,
  Wrench,
  LogOut,
  Building2,
  UserCog,
  Tags
} from 'lucide-react';

interface NavItem {
  title: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  requiresRole?: string[];
}

const navigationItems: NavItem[] = [
  {
    title: 'Dashboard',
    href: '/dashboard',
    icon: Home,
  },
  {
    title: 'Clientes',
    href: '/clientes',
    icon: Users,
  },
  {
    title: 'Produtos',
    href: '/produtos',
    icon: Package,
  },
  {
    title: 'Classificações',
    href: '/produtos/classificacoes',
    icon: Tags,
  },
  {
    title: 'Pedidos',
    href: '/pedidos',
    icon: ShoppingCart,
  },
  {
    title: 'Cargas',
    href: '/cargas',
    icon: Truck,
  },
  {
    title: 'Rotas',
    href: '/rotas',
    icon: Route,
  },
  {
    title: 'Vendedores',
    href: '/vendedores',
    icon: UserCheck,
  },
  {
    title: 'Usuários',
    href: '/usuarios',
    icon: UserCog,
    requiresRole: ['admin', 'manager']
  },
  {
    title: 'Veículos',
    href: '/veiculos',
    icon: Car,
  },
];

const paymentItems: NavItem[] = [
  {
    title: 'Métodos',
    href: '/metodos-pagamento',
    icon: CreditCard,
  },
  {
    title: 'Tabelas',
    href: '/pagamentos/tabelas',
    icon: List,
  },
  {
    title: 'Pagamentos',
    href: '/pagamentos',
    icon: DollarSign,
  },
];

const systemItems: NavItem[] = [
  {
    title: 'Configurações',
    href: '/configuracoes',
    icon: Settings,
  },
  {
    title: 'Manutenção',
    href: '/manutencao',
    icon: Wrench,
    requiresRole: ['admin']
  },
];

export default function SideNav() {
  const location = useLocation();
  const { userProfile, signOut } = useAuth();

  const handleSignOut = async () => {
    await signOut();
  };

  const canAccessItem = (item: NavItem) => {
    if (!item.requiresRole) return true;
    if (!userProfile) return false;
    return item.requiresRole.includes(userProfile.role);
  };

  const renderNavItems = (items: NavItem[]) => {
    return items
      .filter(canAccessItem)
      .map((item) => (
        <SidebarMenuItem key={item.href}>
          <SidebarMenuButton asChild isActive={location.pathname === item.href}>
            <Link to={item.href} className="flex items-center">
              <item.icon className="h-4 w-4" />
              <span>{item.title}</span>
            </Link>
          </SidebarMenuButton>
        </SidebarMenuItem>
      ));
  };

  return (
    <Sidebar>
      <SidebarHeader className="border-b p-4">
        <div className="flex items-center gap-2">
          <Building2 className="h-6 w-6 text-sales-800" />
          <div>
            <h2 className="text-lg font-semibold">Sistema Vendas</h2>
            {userProfile && (
              <p className="text-sm text-gray-600">{userProfile.name}</p>
            )}
          </div>
        </div>
      </SidebarHeader>
      
      <SidebarContent>
        {/* Main Navigation */}
        <SidebarGroup>
          <SidebarGroupLabel>Principal</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(navigationItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* Payments */}
        <SidebarGroup>
          <SidebarGroupLabel>Financeiro</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(paymentItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        <SidebarSeparator />

        {/* System */}
        <SidebarGroup>
          <SidebarGroupLabel>Sistema</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {renderNavItems(systemItems)}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter className="border-t p-4">
        <Button 
          variant="outline" 
          onClick={handleSignOut}
          className="w-full justify-start"
        >
          <LogOut className="h-4 w-4 mr-2" />
          Sair
        </Button>
      </SidebarFooter>
    </Sidebar>
  );
}
