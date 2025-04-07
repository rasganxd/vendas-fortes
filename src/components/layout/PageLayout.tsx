
import React from 'react';
import { cn } from '@/lib/utils';
import SideNav from './SideNav';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function PageLayout({ children, title, subtitle }: PageLayoutProps) {
  return (
    <div className="flex min-h-screen w-full bg-gray-50">
      <SideNav />
      
      <main className="flex-1 p-6">
        <div className="container mx-auto">
          {title && (
            <div className="mb-6">
              <h1 className="text-2xl font-bold text-gray-800">{title}</h1>
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
