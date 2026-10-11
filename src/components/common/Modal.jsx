import React from 'react';
import { X } from 'lucide-react';

export function Modal({ isOpen, onClose, title, subtitle, children, maxWidth = 'max-w-2xl' }) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs">
      <div
        className={`bg-white w-full ${maxWidth} rounded-2xl shadow-xl border border-slate-200 overflow-hidden max-h-[90vh] flex flex-col animate-in fade-in zoom-in-95 duration-150`}
      >
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-base font-semibold text-slate-900">{title}</h3>
            {subtitle && <p className="text-xs text-slate-500 mt-0.5">{subtitle}</p>}
          </div>
          <button
            onClick={onClose}
            className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>
        <div className="p-6 overflow-y-auto space-y-4">{children}</div>
      </div>
    </div>
  );
}

export function AlertBox({ type = 'info', title, message, children, action }) {
  const styles = {
    info: {
      bg: 'bg-blue-50/80 border-blue-200',
      text: 'text-blue-900',
      title: 'text-blue-800',
      bullet: 'bg-blue-500',
    },
    warning: {
      bg: 'bg-amber-50/80 border-amber-200',
      text: 'text-amber-900',
      title: 'text-amber-800',
      bullet: 'bg-amber-500',
    },
    danger: {
      bg: 'bg-rose-50/80 border-rose-200',
      text: 'text-rose-900',
      title: 'text-rose-800',
      bullet: 'bg-rose-500',
    },
    success: {
      bg: 'bg-emerald-50/80 border-emerald-200',
      text: 'text-emerald-900',
      title: 'text-emerald-800',
      bullet: 'bg-emerald-500',
    },
  };

  const current = styles[type] || styles.info;

  return (
    <div className={`border rounded-xl p-4 ${current.bg} ${current.text} text-xs leading-relaxed`}>
      <div className="flex items-start justify-between">
        <div>
          {title && <h4 className={`font-semibold text-sm mb-1 ${current.title}`}>{title}</h4>}
          {message && <p>{message}</p>}
          {children}
        </div>
        {action && <div className="ml-4 shrink-0">{action}</div>}
      </div>
    </div>
  );
}
