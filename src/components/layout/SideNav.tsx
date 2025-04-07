
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
    <Sidebar className="border-r bg-white shadow-sm">
      <SidebarHeader className="px-6 py-5 border-b">
        <h1 className="text-2xl font-bold bg-gradient-to-r from-sales-800 to-teal-600 bg-clip-text text-transparent">SalesTrack</h1>
      </SidebarHeader>
      <SidebarContent>
        <SidebarMenu>
          {navigation.map((item) => {
            const isActive = location.pathname === item.href;
            
            return (
              <SidebarMenuItem key={item.name}>
                <SidebarMenuButton asChild isActive={isActive}>
                  <Link to={item.href} className="scale-hover">
                    <item.icon className="h-5 w-5" />
                    <span>{item.name}</span>
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
