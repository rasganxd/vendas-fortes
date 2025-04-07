
import React from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function PageLayout({ children, title, subtitle }: PageLayoutProps) {
  return (
    <div className="flex-1">
      <div className="container mx-auto px-4 py-8">
        {title && (
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-sales-800 to-teal-600 animate-fade-in">{title}</h1>
            {subtitle && (
              <p className="mt-2 text-gray-600 animate-fade-in" style={{ animationDelay: '0.1s' }}>{subtitle}</p>
            )}
            <div className="h-1.5 w-24 bg-gradient-to-r from-sales-800 to-teal-600 mt-4 rounded-full animate-slide-in-right"></div>
          </div>
        )}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
