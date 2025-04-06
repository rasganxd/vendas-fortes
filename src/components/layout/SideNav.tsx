
import { useState } from 'react';
import { NavLink } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useIsMobile } from '@/hooks/use-mobile';
import {
  LayoutDashboard,
  Users,
  PackageSearch,
  ClipboardList,
  CreditCard,
  MapPin,
  Package,
  Menu,
  X
} from 'lucide-react';

interface NavItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  isCollapsed?: boolean;
}

const NavItem = ({ to, icon, label, isCollapsed }: NavItemProps) => {
  return (
    <NavLink
      to={to}
      className={({ isActive }) =>
        cn(
          "flex items-center gap-2 px-3 py-2 rounded-md text-sm font-medium transition-colors",
          isActive
            ? "bg-sales-800 text-white"
            : "text-gray-700 hover:bg-gray-100"
        )
      }
    >
      {icon}
      {!isCollapsed && <span>{label}</span>}
    </NavLink>
  );
};

export default function SideNav() {
  const isMobile = useIsMobile();
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const iconSize = isCollapsed ? 24 : 20;

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  const toggleMobileMenu = () => {
    setIsMobileMenuOpen(!isMobileMenuOpen);
  };

  const navItems = [
    { to: "/", icon: <LayoutDashboard size={iconSize} />, label: "Dashboard" },
    { to: "/clientes", icon: <Users size={iconSize} />, label: "Clientes" },
    { to: "/produtos", icon: <PackageSearch size={iconSize} />, label: "Produtos" },
    { to: "/pedidos", icon: <ClipboardList size={iconSize} />, label: "Pedidos" },
    { to: "/pagamentos", icon: <CreditCard size={iconSize} />, label: "Pagamentos" },
    { to: "/rotas", icon: <MapPin size={iconSize} />, label: "Roteirização" },
    { to: "/cargas", icon: <Package size={iconSize} />, label: "Cargas" },
  ];

  if (isMobile) {
    return (
      <>
        <div className="fixed top-0 left-0 right-0 bg-white z-20 py-3 px-4 border-b flex justify-between items-center">
          <div className="flex items-center">
            <Button
              variant="ghost"
              size="sm"
              onClick={toggleMobileMenu}
              className="mr-2"
            >
              <Menu size={24} />
            </Button>
            <h1 className="text-xl font-bold text-sales-800">ForcaVendas</h1>
          </div>
        </div>

        {isMobileMenuOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 z-30" onClick={toggleMobileMenu}>
            <div 
              className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg p-4 animate-fade-in"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="flex justify-between items-center mb-6">
                <h2 className="font-bold text-xl text-sales-800">Menu</h2>
                <Button variant="ghost" size="sm" onClick={toggleMobileMenu}>
                  <X size={24} />
                </Button>
              </div>
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <NavItem 
                    key={item.to} 
                    to={item.to} 
                    icon={item.icon} 
                    label={item.label}
                    isCollapsed={false}
                  />
                ))}
              </nav>
            </div>
          </div>
        )}
      </>
    );
  }

  return (
    <div
      className={cn(
        "h-screen fixed left-0 top-0 z-10 flex flex-col border-r bg-white transition-all duration-300",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      <div className="flex items-center justify-between h-16 px-4 border-b">
        {!isCollapsed && (
          <h1 className="text-xl font-bold text-sales-800">ForcaVendas</h1>
        )}
        <Button
          variant="ghost"
          size="sm"
          onClick={toggleCollapse}
          className={cn(isCollapsed ? "mx-auto" : "")}
        >
          {isCollapsed ? <Menu size={24} /> : <X size={20} />}
        </Button>
      </div>
      <div className="flex-1 overflow-auto py-4 px-2">
        <nav className="space-y-1">
          {navItems.map((item) => (
            <NavItem
              key={item.to}
              to={item.to}
              icon={item.icon}
              label={item.label}
              isCollapsed={isCollapsed}
            />
          ))}
        </nav>
      </div>
    </div>
  );
}
