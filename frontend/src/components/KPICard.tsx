import { type LucideIcon } from 'lucide-react';
import { cn, formatCurrency } from '@/lib/utils';

interface KPICardProps {
  label: string;
  value: number;
  icon: LucideIcon;
  variant?: 'default' | 'positive' | 'negative' | 'warning';
  prefix?: string;
}

const variantStyles = {
  default: 'bg-card border-border',
  positive: 'bg-emerald-50 border-emerald-100 dark:bg-emerald-950/30 dark:border-emerald-900/50',
  negative: 'bg-red-50 border-red-100 dark:bg-red-950/30 dark:border-red-900/50',
  warning: 'bg-amber-50 border-amber-100 dark:bg-amber-950/30 dark:border-amber-900/50',
};

const iconStyles = {
  default: 'bg-muted text-muted-foreground',
  positive: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-900/50 dark:text-emerald-400',
  negative: 'bg-red-100 text-red-600 dark:bg-red-900/50 dark:text-red-400',
  warning: 'bg-amber-100 text-amber-600 dark:bg-amber-900/50 dark:text-amber-400',
};

const valueStyles = {
  default: 'text-foreground',
  positive: 'text-emerald-700 dark:text-emerald-400',
  negative: 'text-red-700 dark:text-red-400',
  warning: 'text-amber-700 dark:text-amber-400',
};

export default function KPICard({ label, value, icon: Icon, variant = 'default' }: KPICardProps) {
  return (
    <div className={cn('rounded-2xl border p-5 shadow-card animate-slide-in', variantStyles[variant])}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider mb-2">
            {label}
          </p>
          <p className={cn('text-2xl font-bold leading-none tracking-tight', valueStyles[variant])}>
            {formatCurrency(Math.abs(value))}
          </p>
        </div>
        <div className={cn('w-10 h-10 rounded-xl flex items-center justify-center shrink-0', iconStyles[variant])}>
          <Icon className="w-5 h-5" />
        </div>
      </div>
    </div>
  );
}
