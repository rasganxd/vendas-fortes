
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
  UserRound,
  LucideIcon,
  ChevronRight
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
import { cn } from "@/lib/utils";

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
    <Sidebar variant="sidebar" collapsible="icon" className="border-r shadow-sm">
      <SidebarHeader className="px-5 py-4 flex items-center justify-between bg-gradient-to-r from-sales-700 to-sales-800">
        <h1 className="text-xl font-bold text-white">SalesTrack</h1>
      </SidebarHeader>
      <ScrollArea className="h-full bg-gradient-to-b from-white to-gray-50">
        <SidebarContent className="py-4 px-3">
          <SidebarMenu>
            {Object.entries(groupedNavItems).map(([group, items]) => (
              <div key={group} className="mb-6">
                <h3 className="text-xs uppercase font-semibold text-sales-800/70 px-3 mb-2 flex items-center">
                  <ChevronRight size={14} className="mr-1 text-sales-600" />
                  {groupLabels[group] || group}
                </h3>
                {items.map((item) => {
                  const isActive = location.pathname === item.href;
                  const IconComponent = item.icon as LucideIcon;
                  
                  return (
                    <SidebarMenuItem key={item.title}>
                      <SidebarMenuButton 
                        asChild 
                        isActive={isActive} 
                        tooltip={item.title} 
                        size="sm"
                        className={cn(
                          "transition-all duration-200 rounded-lg",
                          isActive ? "bg-sales-50 text-sales-800 font-medium" : "hover:bg-gray-100"
                        )}
                      >
                        <Link to={item.href} className="flex items-center px-3 py-2 text-sm">
                          {IconComponent && (
                            <div className={cn(
                              "mr-3 flex items-center justify-center w-6 h-6 rounded-md",
                              isActive ? "text-sales-700" : "text-gray-500"
                            )}>
                              <IconComponent size={18} />
                            </div>
                          )}
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
