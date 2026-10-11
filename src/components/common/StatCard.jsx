import React from 'react';

export function StatCard({
  title,
  value,
  subtitle,
  icon: Icon,
  color = 'slate',
  trend,
  isSimulated = false,
  onClick,
}) {
  const accentBorders = {
    rose: 'border-l-4 border-l-rose-500',
    amber: 'border-l-4 border-l-amber-500',
    teal: 'border-l-4 border-l-teal-600',
    blue: 'border-l-4 border-l-blue-600',
    slate: 'border-l-4 border-l-slate-400',
    indigo: 'border-l-4 border-l-indigo-600',
  };

  const iconColors = {
    rose: 'text-rose-600 bg-rose-50 border-rose-200',
    amber: 'text-amber-600 bg-amber-50 border-amber-200',
    teal: 'text-teal-700 bg-teal-50 border-teal-200',
    blue: 'text-blue-600 bg-blue-50 border-blue-200',
    slate: 'text-slate-600 bg-slate-100 border-slate-200',
    indigo: 'text-indigo-600 bg-indigo-50 border-indigo-200',
  };

  return (
    <div
      onClick={onClick}
      className={`bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 transition-all ${
        accentBorders[color] || accentBorders.slate
      } ${onClick ? 'cursor-pointer hover:border-slate-300 hover:shadow-xs' : 'shadow-2xs'}`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="space-y-1.5 flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <span className="text-[14px] font-semibold text-slate-600 tracking-tight truncate">
              {title}
            </span>
            {isSimulated && (
              <span className="text-[11px] bg-slate-100 text-slate-500 px-1.5 py-0.5 rounded font-mono font-medium">
                SIM
              </span>
            )}
          </div>

          <div className="flex items-baseline gap-2.5">
            <span className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight leading-none font-sans">
              {value}
            </span>
            {trend && (
              <span className="text-[13px] font-semibold text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                {trend}
              </span>
            )}
          </div>

          {subtitle && (
            <p className="text-[14px] text-slate-500 font-normal truncate pt-0.5 leading-snug">
              {subtitle}
            </p>
          )}
        </div>

        {Icon && (
          <div
            className={`w-10 h-10 rounded-lg border flex items-center justify-center shrink-0 ${
              iconColors[color] || iconColors.slate
            }`}
          >
            <Icon className="w-5 h-5 stroke-[2]" />
          </div>
        )}
      </div>
    </div>
  );
}
