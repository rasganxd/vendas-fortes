
import React from 'react';
import { cn } from '@/lib/utils';
import SideNav from './SideNav';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
}

export default function PageLayout({ children, title }: PageLayoutProps) {
  const isMobile = useIsMobile();
  
  return (
    <div className="flex min-h-screen bg-gray-50">
      <SideNav />
      
      <main className={cn(
        "flex-1 transition-all duration-300",
        isMobile ? "mt-16 ml-0" : "ml-64"
      )}>
        <div className="container mx-auto py-6 px-4 md:px-6">
          {title && (
            <h1 className="text-2xl font-bold text-sales-800 mb-6">{title}</h1>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
