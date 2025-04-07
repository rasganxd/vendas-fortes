
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
  SidebarHeader
} from "@/components/ui/sidebar";

import { MainNav } from "@/components/layout/main-nav";
import { NavItem } from "@/types";

const navigation: NavItem[] = [
  {
    name: "Dashboard",
    href: "/dashboard",
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
    name: "Vendas",
    href: "/vendas",
    icon: ShoppingCart,
    group: "vendas"
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
]

export default function SideNav() {
  return (
    <Sidebar className="border-r">
      <SidebarHeader className="px-6 py-3 border-b">
        <h1 className="text-xl font-bold">SalesTrack</h1>
      </SidebarHeader>
      <SidebarContent>
        <MainNav items={navigation} />
      </SidebarContent>
    </Sidebar>
  )
}
