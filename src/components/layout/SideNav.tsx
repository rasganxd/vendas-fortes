
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
  Database,
  CreditCard,
  UserRound
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
import { ScrollArea } from "@/components/ui/scroll-area";

const navigation: NavItem[] = [
  {
    title: "Dashboard",
    name: "Dashboard", // For compatibility
    href: "/",
    icon: LayoutDashboard,
    group: "geral"
  },
  {
    title: "Clientes",
    name: "Clientes", // For compatibility
    href: "/clientes",
    icon: Users,
    group: "cadastro"
  },
  {
    title: "Produtos",
    name: "Produtos", // For compatibility
    href: "/produtos",
    icon: Package,
    group: "cadastro"
  },
  {
    title: "Vendedores",
    name: "Vendedores", // For compatibility
    href: "/vendedores",
    icon: UserRound,
    group: "cadastro"
  },
  {
    title: "Pedidos",
    name: "Pedidos", // For compatibility
    href: "/pedidos",
    icon: FileText,
    group: "vendas"
  },
  {
    title: "Pagamentos",
    name: "Pagamentos", // For compatibility
    href: "/pagamentos",
    icon: Coins,
    group: "financeiro"
  },
  {
    title: "Tabelas Pagto",
    name: "Tabelas Pagto", // For compatibility
    href: "/pagamentos/tabelas", 
    icon: CreditCard,
    group: "financeiro"
  },
  {
    title: "Rotas",
    name: "Rotas", // For compatibility
    href: "/rotas",
    icon: ListChecks,
    group: "logistics"
  },
  {
    title: "Cargas",
    name: "Cargas", // For compatibility
    href: "/cargas",
    icon: Package,
    group: "logistics"
  },
  {
    title: "Veículos",
    name: "Veículos", // For compatibility
    href: "/veiculos",
    icon: Truck,
    group: "logistics"
  },
  {
    title: "Config",
    name: "Config", // For compatibility
    href: "/configuracoes",
    icon: Settings,
    group: "sistema"
  },
  {
    title: "Dados",
    name: "Dados", // For compatibility
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
    financeiro: "FINANCEIRO",
    logistics: "LOGÍSTICA",
    sistema: "SISTEMA"
  };
  
  return (
    <Sidebar variant="sidebar" collapsible="icon">
      <SidebarHeader className="px-4 py-3 border-b">
        <h1 className="text-xl font-bold text-sales-800">SalesTrack</h1>
      </SidebarHeader>
      <ScrollArea className="h-full">
        <SidebarContent className="py-2 px-2">
          <SidebarMenu>
            {Object.entries(groupedNavItems).map(([group, items]) => (
              <div key={group} className="mb-3">
                <h3 className="text-xs uppercase font-medium text-gray-500 px-4 mb-1">{groupLabels[group] || group}</h3>
                {items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const Icon = item.icon;
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton asChild isActive={isActive} tooltip={item.title} size="sm">
                        <Link to={item.href} className="flex items-center px-4 py-1.5 text-sm font-medium">
                          {Icon && <Icon className="h-4 w-4 mr-3" />}
                          <span className="truncate">{item.title}</span>
                        </Link>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </div>
            ))}
          </SidebarMenu>
        </SidebarContent>
      </ScrollArea>
    </Sidebar>
  );
}
