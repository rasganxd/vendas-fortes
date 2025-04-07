
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  Package,
  ShoppingCart,
  Users,
  Settings,
  Truck,
  FileText,
  Coins,
  Activity,
  Star,
  Zap
} from "lucide-react";

import { 
  Sidebar, 
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuItem,
  SidebarMenuButton
} from "@/components/ui/sidebar";

import { NavItem } from "@/types";

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/",
    icon: LayoutDashboard,
    group: "geral"
  },
  {
    name: "Clientes",
    href: "/clientes",
    icon: Users,
    group: "cadastro"
  },
  {
    name: "Produtos",
    href: "/produtos",
    icon: Package,
    group: "cadastro"
  },
  {
    name: "Pedidos",
    href: "/pedidos",
    icon: FileText,
    group: "vendas"
  },
  {
    name: "Pagamentos",
    href: "/pagamentos",
    icon: Coins,
    group: "financeiro"
  },
  {
    name: "Roteirização",
    href: "/rotas",
    icon: ListChecks,
    group: "logistics"
  },
  {
    name: "Montagem Cargas",
    href: "/cargas",
    icon: Package,
    group: "logistics"
  },
  {
    name: "Veículos",
    href: "/veiculos",
    icon: Truck,
    group: "logistics"
  },
  {
    name: "Configurações",
    href: "/configuracoes",
    icon: Settings,
    group: "sistema"
  },
];

export default function SideNav() {
  const location = useLocation();
  
  return (
    <Sidebar className="border-r bg-white shadow-lg">
      <SidebarHeader className="px-6 py-6 border-b bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="flex items-center space-x-2">
          <Zap className="h-8 w-8 text-white animate-pulse-slow" />
          <h1 className="text-2xl font-bold text-white">SalesTrack</h1>
        </div>
      </SidebarHeader>
      <SidebarContent>
        <div className="mt-2 mb-6 px-6">
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 p-3 rounded-lg flex items-center space-x-2">
            <Activity className="h-5 w-5 text-blue-600" />
            <span className="text-sm font-medium text-blue-700">Status: Online</span>
          </div>
        </div>
        <SidebarMenu>
          {navigation.map((item, index) => {
            const isActive = location.pathname === item.href;
            
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild isActive={isActive}
                  className={`${isActive ? 'bg-gradient-to-r from-blue-500 to-purple-500 text-white' : 'hover:bg-blue-50'}`}
                  style={{ animationDelay: `${index * 0.05}s` }}
                >
                  <Link to={item.href} className="scale-hover">
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
                    {isActive && <Star className="h-4 w-4 ml-auto text-yellow-300" />}
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
