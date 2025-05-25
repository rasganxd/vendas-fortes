
import React from 'react';
import { Loader } from 'lucide-react';
import { cn } from '@/lib/utils';

interface SavingIndicatorProps {
  isVisible: boolean;
  message?: string;
  className?: string;
}

export function SavingIndicator({ 
  isVisible, 
  message = "Salvando...", 
  className 
}: SavingIndicatorProps) {
  if (!isVisible) return null;

  return (
    <div className={cn(
      "fixed top-4 right-4 z-50 bg-white border border-gray-200 rounded-lg shadow-lg px-4 py-2 flex items-center space-x-2 animate-fade-in",
      className
    )}>
      <Loader className="h-4 w-4 animate-spin text-primary" />
      <span className="text-sm text-gray-700">{message}</span>
    </div>
  );
}

export function InlineSavingIndicator({ 
  isVisible, 
  message = "Salvando...", 
  className 
}: SavingIndicatorProps) {
  return (
    <div className={cn(
      "flex items-center space-x-2 transition-opacity duration-200",
      isVisible ? "opacity-100" : "opacity-0",
      className
    )}>
      <Loader className="h-4 w-4 animate-spin text-primary" />
      <span className="text-sm text-gray-600">{message}</span>
    </div>
  );
}
