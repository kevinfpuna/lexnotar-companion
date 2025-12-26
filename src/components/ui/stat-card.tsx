import { cn } from '@/lib/utils';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  trend?: {
    value: number;
    label: string;
  };
  variant?: 'default' | 'primary' | 'success' | 'warning' | 'destructive';
  className?: string;
}

const variantStyles = {
  default: {
    iconBg: 'bg-muted',
    iconColor: 'text-muted-foreground',
  },
  primary: {
    iconBg: 'bg-primary/10',
    iconColor: 'text-primary',
  },
  success: {
    iconBg: 'bg-success/10',
    iconColor: 'text-success',
  },
  warning: {
    iconBg: 'bg-warning/10',
    iconColor: 'text-warning',
  },
  destructive: {
    iconBg: 'bg-destructive/10',
    iconColor: 'text-destructive',
  },
};

export function StatCard({ 
  title, 
  value, 
  subtitle, 
  icon: Icon, 
  trend, 
  variant = 'default',
  className 
}: StatCardProps) {
  const styles = variantStyles[variant];

  return (
    <div className={cn("stat-card animate-fade-in", className)}>
      <div className="flex items-start justify-between gap-2">
        <div className="space-y-0.5 min-w-0 flex-1">
          <p className="text-xs sm:text-sm font-medium text-muted-foreground truncate">{title}</p>
          <p className="text-lg sm:text-xl md:text-2xl font-bold tracking-tight truncate">{value}</p>
          {subtitle && (
            <p className="text-xs sm:text-sm text-muted-foreground truncate">{subtitle}</p>
          )}
        </div>
        <div className={cn("p-2 sm:p-3 rounded-lg shrink-0", styles.iconBg)}>
          <Icon className={cn("h-4 w-4 sm:h-5 sm:w-5 md:h-6 md:w-6", styles.iconColor)} />
        </div>
      </div>
      
      {trend && (
        <div className="mt-3 flex items-center gap-1 text-xs sm:text-sm">
          <span className={cn(
            "font-medium",
            trend.value >= 0 ? "text-success" : "text-destructive"
          )}>
            {trend.value >= 0 ? '+' : ''}{trend.value}%
          </span>
          <span className="text-muted-foreground truncate">{trend.label}</span>
        </div>
      )}
    </div>
  );
}
