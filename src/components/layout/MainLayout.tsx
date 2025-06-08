
import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Menu } from 'lucide-react';
import SideNav from './SideNav';

export default function MainLayout() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  const toggleMobileSidebar = () => {
    setSidebarOpen(!sidebarOpen);
  };

  return (
    <div className="min-h-screen bg-background flex w-full">
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      
      {/* Desktop Sidebar */}
      <div className={cn(
        "hidden md:flex flex-col border-r bg-card transition-all duration-300",
        sidebarCollapsed ? "w-16" : "w-64"
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          {!sidebarCollapsed && (
            <h2 className="text-lg font-semibold">Sistema</h2>
          )}
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleSidebar}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <SideNav isCollapsed={sidebarCollapsed} />
      </div>

      {/* Mobile Sidebar */}
      <div className={cn(
        "fixed inset-y-0 left-0 z-50 w-64 bg-card border-r transform transition-transform duration-300 md:hidden",
        sidebarOpen ? "translate-x-0" : "-translate-x-full"
      )}>
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">Sistema</h2>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setSidebarOpen(false)}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
        </div>
        <SideNav isCollapsed={false} />
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0">
        {/* Mobile Header */}
        <div className="md:hidden flex items-center justify-between p-4 border-b bg-card">
          <Button
            variant="ghost"
            size="icon"
            onClick={toggleMobileSidebar}
            className="h-8 w-8"
          >
            <Menu className="h-4 w-4" />
          </Button>
          <h2 className="text-lg font-semibold">Sistema</h2>
          <div className="w-8" /> {/* Spacer for centering */}
        </div>

        {/* Page Content */}
        <main className="flex-1 overflow-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
