
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
}

export default function DashboardCard({
  title,
  value,
  icon,
  trend,
  valueClassName,
}: DashboardCardProps) {
  return (
    <div className="bg-white rounded-lg p-6 border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 transform hover:-translate-y-1">
      <div className="flex items-center justify-between">
        <h3 className="text-sm font-medium text-gray-500">{title}</h3>
        {icon && (
          <div className="h-8 w-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
            {icon}
          </div>
        )}
      </div>
      <div className="mt-2">
        <span className={cn('text-2xl font-bold', valueClassName)}>
          {value}
        </span>
        
        {trend && (
          <div className="flex items-center mt-2">
            <span
              className={cn(
                'text-xs font-medium flex items-center',
                trend.isPositive ? 'text-green-600' : 'text-red-600'
              )}
            >
              {trend.isPositive ? (
                <ArrowUpIcon className="h-3 w-3 mr-1" />
              ) : (
                <ArrowDownIcon className="h-3 w-3 mr-1" />
              )}
              {trend.value}%
            </span>
            <span className="text-xs text-gray-400 ml-1">vs. mês anterior</span>
          </div>
        )}
      </div>
    </div>
  );
}
