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

import { NavItem } from "@/types";
import { MainNav } from "./main-nav";
import { Sidebar } from "./sidebar";

interface DashboardShellProps {
  children: React.ReactNode;
}

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
    <Sidebar className="w-64 border-r flex-col">
      <div className="px-6 py-4">
        {/* <Link href="#" className="flex items-center gap-2 font-semibold">
          <Icons.logo className="h-6 w-6" />
          <span>Acme</span>
        </Link> */}
        <h1 className="font-bold text-2xl">SalesTrack</h1>
      </div>
      <MainNav items={navigation} />
      {/* <div className="mt-auto border-t py-2">
        <ThemeToggle />
      </div> */}
    </Sidebar>
  )
}
