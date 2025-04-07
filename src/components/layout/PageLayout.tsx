
import React from 'react';
import { cn } from '@/lib/utils';
import SideNav from './SideNav';
import { useIsMobile } from '@/hooks/use-mobile';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string; // Added subtitle prop
}

export default function PageLayout({ children, title, subtitle }: PageLayoutProps) {
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
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-sales-800">{title}</h1>
              {subtitle && (
                <p className="mt-1 text-gray-600">{subtitle}</p>
              )}
            </div>
          )}
          {children}
        </div>
      </main>
    </div>
  );
}
