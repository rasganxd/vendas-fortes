
import React from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, Home, ShoppingCart, Route, User } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';

interface MobileLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBottomNav?: boolean;
}

export default function MobileLayout({ 
  children, 
  title = "App Mobile",
  showBottomNav = true 
}: MobileLayoutProps) {
  const { userProfile, signOut } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const handleSignOut = async () => {
    await signOut();
    navigate('/auth');
  };

  const navigationItems = [
    { 
      path: '/mobile', 
      icon: Home, 
      label: 'Início',
      active: location.pathname === '/mobile'
    },
    { 
      path: '/mobile/vendas', 
      icon: ShoppingCart, 
      label: 'Vendas',
      active: location.pathname.includes('/mobile/vendas')
    },
    { 
      path: '/mobile/rotas', 
      icon: Route, 
      label: 'Rotas',
      active: location.pathname.includes('/mobile/rotas')
    },
    { 
      path: '/mobile/perfil', 
      icon: User, 
      label: 'Perfil',
      active: location.pathname === '/mobile/perfil'
    }
  ];

  return (
    <div className="flex flex-col h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-sales-800 text-white p-4 shadow-md">
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-lg font-semibold">{title}</h1>
            {userProfile && (
              <p className="text-sm text-sales-200">Olá, {userProfile.name}</p>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSignOut}
            className="text-white hover:bg-sales-700"
          >
            <LogOut size={20} />
          </Button>
        </div>
      </header>

      {/* Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>

      {/* Bottom Navigation */}
      {showBottomNav && (
        <nav className="bg-white border-t border-gray-200 p-2">
          <div className="flex justify-around">
            {navigationItems.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => navigate(item.path)}
                  className={cn(
                    "flex flex-col items-center py-2 px-3 rounded-lg transition-colors",
                    item.active 
                      ? "text-sales-800 bg-sales-50" 
                      : "text-gray-500 hover:text-sales-600"
                  )}
                >
                  <Icon size={20} />
                  <span className="text-xs mt-1">{item.label}</span>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </div>
  );
}
