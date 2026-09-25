import React from 'react';
import { LucideIcon } from 'lucide-react';

interface PageHeaderProps {
  title: string;
  subtitle: string;
  icon?: LucideIcon;
  iconColor?: string;
  iconBg?: string;
  badge?: string | React.ReactNode;
  actions?: React.ReactNode;
}

export const PageHeader: React.FC<PageHeaderProps> = ({
  title,
  subtitle,
  icon: Icon,
  iconColor = 'text-sky-600',
  iconBg = 'bg-sky-50 border-sky-100',
  badge,
  actions,
}) => {
  return (
    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-1">
      <div className="flex items-start gap-3.5">
        {Icon && (
          <div className={`w-11 h-11 rounded-2xl flex items-center justify-center border shrink-0 shadow-2xs ${iconBg}`}>
            <Icon className={`w-5 h-5 ${iconColor}`} />
          </div>
        )}
        <div className="space-y-0.5">
          <div className="flex items-center gap-2.5 flex-wrap">
            <h1 className="text-2xl font-bold tracking-tight text-slate-900 leading-tight">
              {title}
            </h1>
            {badge && (
              typeof badge === 'string' ? (
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-sky-100 text-sky-800 border border-sky-200/80">
                  {badge}
                </span>
              ) : (
                badge
              )
            )}
          </div>
          <p className="text-sm text-slate-500 leading-normal">
            {subtitle}
          </p>
        </div>
      </div>

      {actions && (
        <div className="flex items-center gap-2.5 flex-wrap self-end sm:self-center shrink-0">
          {actions}
        </div>
      )}
    </div>
  );
};
