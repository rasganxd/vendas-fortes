
import { cn } from '@/lib/utils';

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
  valueClassName?: string;
}

export default function DashboardCard({
  title,
  value,
  icon,
  trend,
  className,
  valueClassName
}: DashboardCardProps) {
  return (
    <div className={cn("sales-card", className)}>
      <div className="flex justify-between items-start mb-2">
        <h3 className="text-gray-600 font-medium text-sm">{title}</h3>
        {icon && <div className="text-sales-600">{icon}</div>}
      </div>
      <div className="flex justify-between items-end">
        <div className="flex flex-col">
          <p className={cn("text-2xl font-bold", valueClassName)}>{value}</p>
          {trend && (
            <p className={`text-sm flex items-center mt-1 ${
              trend.isPositive ? 'text-green-600' : 'text-red-600'
            }`}>
              {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
