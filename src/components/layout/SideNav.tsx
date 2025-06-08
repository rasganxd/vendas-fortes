
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";
import { 
  Home, 
  Package, 
  ShoppingCart, 
  Users, 
  CreditCard, 
  Receipt,
  Smartphone,
  Settings, 
  Wrench,
  Truck,
  Route,
  Package2,
  Banknote,
  List
} from "lucide-react";
import { useLocation, useNavigate } from "react-router-dom";

interface SideNavProps {
  isCollapsed: boolean;
}

export default function SideNav({ isCollapsed }: SideNavProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const menuItems = [
    { 
      icon: Home, 
      label: "Dashboard", 
      path: "/dashboard",
      description: "Visão geral do sistema"
    },
    { 
      icon: Package, 
      label: "Produtos", 
      path: "/produtos",
      description: "Gestão de produtos"
    },
    { 
      icon: ShoppingCart, 
      label: "Pedidos", 
      path: "/pedidos",
      description: "Gestão de pedidos"
    },
    { 
      icon: Smartphone, 
      label: "Import. Mobile", 
      path: "/pedidos/importar-mobile",
      description: "Importar pedidos mobile"
    },
    { 
      icon: Users, 
      label: "Clientes", 
      path: "/clientes",
      description: "Gestão de clientes"
    },
    { 
      icon: CreditCard, 
      label: "Pagamentos", 
      path: "/pagamentos",
      description: "Gestão de pagamentos"
    },
    { 
      icon: Receipt, 
      label: "Vendedores", 
      path: "/vendedores",
      description: "Gestão de vendedores"
    },
    { 
      icon: Truck, 
      label: "Veículos", 
      path: "/veiculos",
      description: "Gestão de veículos"
    },
    { 
      icon: Route, 
      label: "Rotas", 
      path: "/rotas",
      description: "Gestão de rotas"
    },
    { 
      icon: Package2, 
      label: "Cargas", 
      path: "/cargas",
      description: "Gestão de cargas"
    },
    { 
      icon: Settings, 
      label: "Configurações", 
      path: "/configuracoes",
      description: "Configurações do sistema"
    }
  ];

  const handleNavigation = (path: string) => {
    navigate(path);
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 py-4">
        <nav className="grid gap-1 px-2">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const isActive = location.pathname === item.path;
            
            return (
              <Button
                key={item.path}
                variant={isActive ? "secondary" : "ghost"}
                className={cn(
                  "justify-start h-10 px-3",
                  isActive && "bg-secondary text-secondary-foreground font-medium",
                  isCollapsed && "px-2"
                )}
                onClick={() => handleNavigation(item.path)}
              >
                <Icon className={cn("h-4 w-4", !isCollapsed && "mr-3")} />
                {!isCollapsed && (
                  <span className="truncate">{item.label}</span>
                )}
              </Button>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
