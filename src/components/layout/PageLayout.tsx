import React from 'react';
import { cn } from '@/lib/utils';
import { useAppContext } from '@/hooks/useAppContext';
import { CustomScrollArea } from '@/components/ui/custom-scroll-area';
import ConnectionStatus from '@/components/ui/ConnectionStatus';

interface PageLayoutProps {
  children: React.ReactNode;
  title?: string;
  subtitle?: string;
  description?: string;
  showConnectionStatus?: boolean;
  fullWidth?: boolean;
}

export default function PageLayout({ 
  children, 
  title, 
  subtitle, 
  description,
  showConnectionStatus = true,
  fullWidth = false
}: PageLayoutProps) {
  const { settings } = useAppContext();
  
  return (
    <div className="flex-1 bg-background w-full min-h-screen">
      <div className={cn(
        fullWidth ? "w-full px-2 py-5" : "container mx-auto px-2 py-5"
      )}>
        {title && (
          <div className="mb-8">
            <div className="flex justify-between items-center">
              <div>
                <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                  {title}
                </h1>
                {subtitle && (
                  <p className="mt-1 text-sm text-gray-500">{subtitle}</p>
                )}
                {description && (
                  <p className="mt-2 text-sm text-gray-500">{description}</p>
                )}
              </div>
              {showConnectionStatus && (
                <ConnectionStatus />
              )}
            </div>
            <div className="h-1 w-20 mt-3 rounded-full bg-blue-500"></div>
          </div>
        )}
        <div>
          {children}
        </div>
      </div>
    </div>
  );
}
