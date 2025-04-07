
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
      <div className="container mx-auto px-6 py-10">
        {title && (
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-600 to-purple-600 animate-fade-in">{title}</h1>
            {subtitle && (
              <p className="mt-3 text-xl text-gray-700 animate-fade-in" style={{ animationDelay: '0.1s' }}>{subtitle}</p>
            )}
            <div className="h-1.5 w-32 bg-gradient-to-r from-blue-500 to-purple-500 mt-4 rounded-full animate-slide-in-right"></div>
          </div>
        )}
        <div className="animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {children}
        </div>
      </div>
    </div>
  );
}
