
import React from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
}

export default function PageLayout({ children, title, subtitle }: PageLayoutProps) {
  return (
    <div className="flex-1 bg-gray-50">
      <div className="container mx-auto px-4 py-6">
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-700 to-blue-500 animate-fade-in">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-700 animate-fade-in" style={{ animationDelay: '0.1s' }}>{subtitle}</p>
            )}
            <div className="h-1 w-24 bg-gradient-to-r from-blue-700 to-blue-400 mt-2 rounded-full animate-slide-in-right"></div>
          </div>
        )}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
