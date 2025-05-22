
import React from 'react';
import { ArrowUpIcon, ArrowDownIcon } from 'lucide-react';
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  valueClassName?: string;
  className?: string;
}

export default function DashboardCard({
  title,
  value,
  icon,
  trend,
  valueClassName,
  className,
}: DashboardCardProps) {
  return (
    <div className={cn(
      "rounded-lg p-6 border shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1",
      className || "bg-white border-blue-100" // Soft blue border
    )}>
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-700">{title}</h3>
        {icon && (
          <div className="h-10 w-10 rounded-full bg-blue-50 border border-blue-100 shadow-sm flex items-center justify-center text-blue-500">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2">
        <span className={cn('text-2xl font-bold text-gray-900', valueClassName)}>
          {value}
        </span>
        
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                'text-xs font-medium flex items-center',
                trend.isPositive ? 'text-green-700' : 'text-red-700'
              )}
            >
              {trend.isPositive ? (
                <ArrowUpIcon className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownIcon className="h-3 w-3 mr-1" />
              )}
              {trend.value}%
            </span>
            <span className="text-xs text-gray-600 ml-1">vs. mês anterior</span>
          </div>
        )}
      </div>
    </div>
  );
}
