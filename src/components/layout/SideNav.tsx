
import { Link, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  ListChecks,
  Package,
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
    name: "Rotas",
    href: "/rotas",
    icon: ListChecks,
    group: "logistics"
  },
  {
    name: "Cargas",
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
    name: "Config",
    href: "/configuracoes",
    icon: Settings,
    group: "sistema"
  },
  {
    name: "Dados",
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
    geral: "GERAL",
    cadastro: "CADASTRO",
    vendas: "VENDAS",
    financeiro: "FIN.",
    logistics: "LOGÍSTICA",
    sistema: "SISTEMA"
  };
  
  return (
    <Sidebar className="border-r bg-white shadow-sm" variant="sidebar" collapsible="icon">
      <SidebarHeader className="px-2 py-3 border-b">
        <h1 className="text-base font-bold text-sales-800">SalesTrack</h1>
      </SidebarHeader>
      <SidebarContent className="py-1">
        <SidebarMenu>
          {Object.entries(groupedNavItems).map(([group, items]) => (
            <div key={group} className="mb-2">
              <h3 className="text-xs uppercase font-medium text-gray-500 px-2 mb-1">{groupLabels[group] || group}</h3>
              {items.map((item) => {
                const isActive = location.pathname === item.href;
                
                return (
                  <SidebarMenuItem key={item.name}>
                    <SidebarMenuButton asChild isActive={isActive} tooltip={item.name} size="sm">
                      <Link to={item.href} className="flex items-center px-2 py-1 text-sm">
                        <item.icon className="h-3.5 w-3.5 mr-1" />
                        <span className="truncate">{item.name}</span>
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
