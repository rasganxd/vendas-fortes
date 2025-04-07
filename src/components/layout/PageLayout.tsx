
import React from 'react';
import { cn } from '@/lib/utils';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string; // Add description prop to match usage in Settings.tsx
}

export default function PageLayout({ children, title, subtitle, description }: PageLayoutProps) {
  return (
    <div className="flex-1 bg-gray-50">
      <div className="container mx-auto px-4 py-5">
        {title && (
          <div className="mb-6">
            <h1 className="text-2xl font-semibold text-sales-800">{title}</h1>
            {subtitle && (
              <p className="mt-1 text-sm text-gray-600">{subtitle}</p>
            )}
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
            <div className="h-1 w-16 bg-sales-800 mt-2 rounded-full"></div>
          </div>
        )}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
