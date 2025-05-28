
import React from 'react';
import { cn } from '@/lib/utils';

interface LoadingSkeletonProps {
  className?: string;
  variant?: 'text' | 'circular' | 'rectangular' | 'card' | 'table';
  rows?: number;
  animation?: 'pulse' | 'wave';
}

const LoadingSkeleton: React.FC<LoadingSkeletonProps> = ({ 
  className, 
  variant = 'rectangular',
  rows = 1,
  animation = 'pulse'
}) => {
  const baseClasses = cn(
    "bg-gradient-to-r from-gray-200 via-gray-300 to-gray-200 bg-[length:200%_100%]",
    {
      'animate-pulse': animation === 'pulse',
      'animate-[shimmer_2s_infinite] bg-[linear-gradient(90deg,transparent,rgba(255,255,255,0.4),transparent)]': animation === 'wave'
    }
  );

  const variants = {
    text: "h-4 rounded",
    circular: "rounded-full aspect-square",
    rectangular: "h-4 rounded",
    card: "h-32 rounded-lg",
    table: "h-8 rounded"
  };

  if (variant === 'table' && rows > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div key={index} className={cn(baseClasses, variants[variant], className)} />
        ))}
      </div>
    );
  }

  if (variant === 'text' && rows > 1) {
    return (
      <div className="space-y-2">
        {Array.from({ length: rows }).map((_, index) => (
          <div 
            key={index} 
            className={cn(
              baseClasses, 
              variants[variant], 
              index === rows - 1 ? "w-3/4" : "w-full",
              className
            )} 
          />
        ))}
      </div>
    );
  }

  return <div className={cn(baseClasses, variants[variant], className)} />;
};

// Skeleton específicos para componentes
export const ProductCardSkeleton = () => (
  <div className="p-6 border rounded-lg space-y-4 animate-fade-in">
    <div className="flex items-center space-x-4">
      <LoadingSkeleton variant="circular" className="w-12 h-12" />
      <div className="space-y-2 flex-1">
        <LoadingSkeleton variant="text" className="w-3/4" />
        <LoadingSkeleton variant="text" className="w-1/2" />
      </div>
    </div>
    <LoadingSkeleton variant="text" rows={2} />
    <div className="flex justify-between items-center">
      <LoadingSkeleton variant="text" className="w-20" />
      <LoadingSkeleton variant="rectangular" className="w-16 h-6" />
    </div>
  </div>
);

export const TableSkeleton = ({ rows = 5, columns = 4 }: { rows?: number; columns?: number }) => (
  <div className="space-y-2 animate-fade-in">
    {/* Header */}
    <div className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
      {Array.from({ length: columns }).map((_, index) => (
        <LoadingSkeleton key={index} variant="text" className="h-6" />
      ))}
    </div>
    {/* Rows */}
    {Array.from({ length: rows }).map((_, rowIndex) => (
      <div key={rowIndex} className="grid gap-4" style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}>
        {Array.from({ length: columns }).map((_, colIndex) => (
          <LoadingSkeleton key={colIndex} variant="table" />
        ))}
      </div>
    ))}
  </div>
);

export default LoadingSkeleton;
