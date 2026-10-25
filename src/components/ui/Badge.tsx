import React from 'react';
import { cn } from '@/lib/utils';

export interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'primary' | 'secondary' | 'success' | 'warning' | 'danger' | 'neutral';
  pulse?: boolean;
}

export function Badge({
  className,
  variant = 'primary',
  pulse = false,
  children,
  ...props
}: BadgeProps) {
  const variants = {
    primary: 'bg-teal-50 text-teal-700 border-teal-200/60 dark:bg-teal-950/70 dark:text-teal-300 dark:border-teal-800/80',
    secondary: 'bg-sky-50 text-sky-700 border-sky-200/60 dark:bg-sky-950/70 dark:text-sky-300 dark:border-sky-800/80',
    success: 'bg-emerald-50 text-emerald-700 border-emerald-200/60 dark:bg-emerald-950/70 dark:text-emerald-300 dark:border-emerald-800/80',
    warning: 'bg-amber-50 text-amber-700 border-amber-200/60 dark:bg-amber-950/70 dark:text-amber-300 dark:border-amber-800/80',
    danger: 'bg-rose-50 text-rose-700 border-rose-200/60 dark:bg-rose-950/70 dark:text-rose-300 dark:border-rose-800/80',
    neutral: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  };

  const pulseColors = {
    primary: 'bg-teal-500',
    secondary: 'bg-sky-500',
    success: 'bg-emerald-500',
    warning: 'bg-amber-500',
    danger: 'bg-rose-500',
    neutral: 'bg-slate-500',
  };

  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold border transition-colors',
        variants[variant],
        className
      )}
      {...props}
    >
      {pulse && (
        <span className="relative flex h-2 w-2">
          <span
            className={cn(
              'animate-ping absolute inline-flex h-full w-full rounded-full opacity-75',
              pulseColors[variant]
            )}
          />
          <span
            className={cn(
              'relative inline-flex rounded-full h-2 w-2',
              pulseColors[variant]
            )}
          />
        </span>
      )}
      {children}
    </span>
  );
}
