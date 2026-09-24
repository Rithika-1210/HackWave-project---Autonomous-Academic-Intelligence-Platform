import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  change?: string;
  changeType?: 'positive' | 'negative' | 'neutral';
  description?: string;
  iconColor?: string;
  iconBg?: string;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  icon: Icon,
  change,
  changeType = 'neutral',
  description,
  iconColor = 'text-sky-600',
  iconBg = 'bg-sky-50 border-sky-100',
}) => {
  return (
    <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-xs hover:shadow-md transition-all duration-200">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">{title}</p>
          <h3 className="text-2xl font-extrabold text-slate-900 mt-1 font-mono tracking-tight">{value}</h3>
          {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
        </div>
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center border ${iconBg}`}>
          <Icon className={`w-5 h-5 ${iconColor}`} />
        </div>
      </div>
      {change && (
        <div className="mt-3 pt-3 border-t border-slate-100 flex items-center text-xs">
          <span
            className={`font-semibold ${
              changeType === 'positive'
                ? 'text-emerald-600'
                : changeType === 'negative'
                ? 'text-rose-600'
                : 'text-slate-600'
            }`}
          >
            {change}
          </span>
          <span className="text-slate-400 ml-1.5 font-normal">vs last term</span>
        </div>
      )}
    </div>
  );
};
