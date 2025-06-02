
import React from 'react';
import { CheckCircle, AlertTriangle, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProductRowIndicatorProps {
  status: 'saved' | 'error' | 'saving' | 'none';
  message?: string;
  className?: string;
}

const ProductRowIndicator: React.FC<ProductRowIndicatorProps> = ({
  status,
  message,
  className
}) => {
  if (status === 'none') return null;

  const getIcon = () => {
    switch (status) {
      case 'saved':
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case 'error':
        return <AlertTriangle className="h-4 w-4 text-red-600" />;
      case 'saving':
        return <Clock className="h-4 w-4 text-blue-600 animate-pulse" />;
      default:
        return null;
    }
  };

  const getStyles = () => {
    switch (status) {
      case 'saved':
        return 'bg-green-50 border-green-200';
      case 'error':
        return 'bg-red-50 border-red-200';
      case 'saving':
        return 'bg-blue-50 border-blue-200';
      default:
        return '';
    }
  };

  return (
    <div className={cn(
      'absolute inset-0 pointer-events-none transition-all duration-300',
      getStyles(),
      className
    )}>
      <div className="absolute top-2 right-2 flex items-center gap-1">
        {getIcon()}
        {message && (
          <span className="text-xs text-gray-600 max-w-24 truncate">
            {message}
          </span>
        )}
      </div>
    </div>
  );
};

export default ProductRowIndicator;
