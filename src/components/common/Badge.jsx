import React from 'react';

export function Badge({ children, variant = 'slate', size = 'sm', className = '' }) {
  const variantStyles = {
    slate: 'bg-slate-100 text-slate-700 border-slate-200/90',
    blue: 'bg-blue-50 text-blue-800 border-blue-200/90 font-medium',
    teal: 'bg-teal-50 text-teal-800 border-teal-200/90 font-semibold',
    emerald: 'bg-emerald-50 text-emerald-800 border-emerald-200/90 font-semibold',
    amber: 'bg-amber-50 text-amber-800 border-amber-200/90 font-semibold',
    rose: 'bg-rose-50 text-rose-800 border-rose-200/90 font-semibold',
    navy: 'bg-[#0B132B] text-slate-200 border-slate-700 font-medium',
    indigo: 'bg-indigo-50 text-indigo-800 border-indigo-200/90 font-medium',
  };

  const sizeStyles = {
    xs: 'px-2.5 py-0.5 text-[12px] font-medium leading-normal tracking-wide',
    sm: 'px-2.5 py-0.5 text-[12px] font-medium leading-normal',
    md: 'px-3 py-1 text-[13px] font-semibold leading-normal',
    lg: 'px-3.5 py-1.5 text-[14px] font-semibold leading-normal',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-md border ${
        variantStyles[variant] || variantStyles.slate
      } ${sizeStyles[size] || sizeStyles.sm} ${className}`}
    >
      {children}
    </span>
  );
}
