
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
  Database
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
  {
    name: "Manutenção",
    href: "/manutencao",
    icon: Database,
    group: "sistema"
  },
];

export default function SideNav() {
  const location = useLocation();
  
  // Group the navigation items by their group
  const groupedNavItems = navigation.reduce((groups, item) => {
    const group = groups[item.group] || [];
    group.push(item);
    groups[item.group] = group;
    return groups;
  }, {} as Record<string, NavItem[]>);

  // Labels for groups
  const groupLabels: Record<string, string> = {
    geral: "Geral",
    cadastro: "Cadastros",
    vendas: "Vendas",
    financeiro: "Financeiro",
    logistics: "Logística",
    sistema: "Sistema"
  };
  
  return (
    <Sidebar className="border-r bg-white shadow-sm">
      <SidebarHeader className="px-4 py-4 border-b">
        <h1 className="text-xl font-bold text-sales-800">SalesTrack</h1>
      </SidebarHeader>
      <SidebarContent className="py-2">
        <SidebarMenu>
          {Object.entries(groupedNavItems).map(([group, items]) => (
            <div key={group} className="mb-4">
              <h3 className="text-xs uppercase font-medium text-gray-500 px-4 mb-2">{groupLabels[group] || group}</h3>
              {items.map((item) => {
                const isActive = location.pathname === item.href;
                
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link to={item.href} className="flex items-center px-4 py-2 text-sm">
                        <item.icon className="h-4 w-4 mr-3" />
                        <span>{item.name}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </div>
          ))}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
