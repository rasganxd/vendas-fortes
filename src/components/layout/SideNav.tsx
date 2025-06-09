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
  ChevronRight,
  PlusCircle,
  BarChart3
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
import { CustomScrollArea } from "@/components/ui/custom-scroll-area";
import { cn } from "@/lib/utils";
import { useTheme } from "@/components/theme-provider";
import { useAppContext } from "@/hooks/useAppContext";
import { useEffect } from "react";

// Define navigation items - adicionado item "Relatórios de Vendas"
const navigation: NavItem[] = [
  {
    title: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    group: "geral"
  },
  {
    title: "Clientes",
    href: "/clientes",
    icon: Users,
    group: "cadastro"
  },
  {
    title: "Produtos",
    href: "/produtos",
    icon: Package,
    group: "cadastro"
  },
  {
    title: "Vendedores",
    href: "/vendedores",
    icon: UserRound,
    group: "cadastro"
  },
  {
    title: "Pedidos",
    href: "/pedidos",
    icon: FileText,
    group: "vendas"
  },
  {
    title: "Digitar Pedido",
    href: "/pedidos/novo",
    icon: PlusCircle,
    group: "vendas"
  },
  {
    title: "Relatórios de Vendas",
    href: "/relatorios-vendas",
    icon: BarChart3,
    group: "vendas"
  },
  {
    title: "Pagamentos",
    href: "/pagamentos",
    icon: Coins,
    group: "financeiro"
  },
  {
    title: "Tabelas Pagto",
    href: "/pagamentos/tabelas", 
    icon: CreditCard,
    group: "financeiro"
  },
  {
    title: "Rotas",
    href: "/rotas",
    icon: ListChecks,
    group: "logistics"
  },
  {
    title: "Cargas",
    href: "/carregamentos",
    icon: Package,
    group: "logistics"
  },
  {
    title: "Veículos",
    href: "/veiculos",
    icon: Truck,
    group: "logistics"
  },
  {
    title: "Config",
    href: "/configuracoes",
    icon: Settings,
    group: "sistema"
  },
  {
    title: "Manutenção",
    href: "/manutencao",
    icon: Database,
    group: "sistema"
  },
];

export default function SideNav() {
  const location = useLocation();
  const { theme } = useTheme();
  const { settings } = useAppContext();
  
  // Listen for theme changes with simplified effect
  useEffect(() => {
    // Add dynamic-sidebar class to the sidebar header to allow styling from CSS
    const sidebarHeader = document.querySelector('.dynamic-sidebar-header') as HTMLElement;
    if (sidebarHeader) {
      sidebarHeader.style.backgroundColor = '#4a86e8'; // Soft blue color for sidebar header
      sidebarHeader.style.color = '#ffffff';
    }
    
    console.log("Theme change detected in SideNav");
  }, []);
  
  // Group the navigation items by their group
  const groupedNavItems = navigation.reduce((groups, item) => {
    const group = item.group || 'other';
    const groupArray = groups[group] || [];
    groupArray.push(item);
    groups[group] = groupArray;
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
    <Sidebar variant="sidebar" collapsible="icon" className="border-r shadow-medium bg-blue-50">
      <SidebarHeader className="px-5 py-4 flex items-center justify-between dynamic-sidebar-header transition-colors">
        <h1 className="text-xl font-bold text-white">SalesTrack</h1>
      </SidebarHeader>
      <CustomScrollArea hideScrollbar={true} className="h-[calc(100vh-64px)]">
        <SidebarContent className="py-4 px-3">
          <SidebarMenu>
            {Object.entries(groupedNavItems).map(([group, items]) => (
              <div key={group} className="mb-6">
                <h3 className="text-xs uppercase font-semibold text-blue-800/80 px-3 mb-2 flex items-center">
                  <ChevronRight size={14} className="mr-1 text-blue-800/80" />
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
                          isActive ? 
                            "active-menu-item font-medium" : 
                            "text-blue-900 hover:bg-blue-100 hover:text-blue-700"
                        )}
                      >
                        <Link to={item.href} className="flex items-center px-3 py-2 text-sm">
                          {IconComponent && (
                            <div className={cn(
                              "mr-3 flex items-center justify-center w-6 h-6 rounded-md",
                              isActive ? "active-icon" : "text-blue-700"
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
      </CustomScrollArea>
    </Sidebar>
  );
}
