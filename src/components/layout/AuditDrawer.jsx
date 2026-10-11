import React from 'react';
import { X, Clock, FileText } from 'lucide-react';
import { useFleetRipple } from '../../context/FleetRippleContext';
import { Badge } from '../common/Badge';

export function AuditDrawer({ isOpen, onClose }) {
  const { auditLogs } = useFleetRipple();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-xs">
      <div className="bg-white w-full max-w-lg h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
        <div className="px-6 py-5 border-b border-slate-800 flex items-center justify-between bg-[#0B132B] text-white">
          <div>
            <div className="flex items-center gap-2.5">
              <FileText className="w-5 h-5 text-teal-400" />
              <h3 className="text-base font-bold text-white tracking-tight">Platform Activity & Audit Trail</h3>
            </div>
            <p className="text-xs text-slate-300 mt-1">
              Chronological log of simulated operational events
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-3.5">
          {auditLogs.map((log) => {
            const badgeVariant =
              log.badgeColor === 'rose'
                ? 'rose'
                : log.badgeColor === 'teal'
                ? 'teal'
                : log.badgeColor === 'amber'
                ? 'amber'
                : log.badgeColor === 'indigo'
                ? 'indigo'
                : 'navy';

            return (
              <div
                key={log.id}
                className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-sm hover:border-slate-300 transition-colors space-y-2 shadow-2xs"
              >
                <div className="flex items-center justify-between">
                  <Badge variant={badgeVariant} size="sm">
                    {log.type}
                  </Badge>
                  <div className="flex items-center gap-1.5 text-xs text-slate-500 font-mono">
                    <Clock className="w-3.5 h-3.5 text-slate-400" />
                    <span>{log.timestamp}</span>
                  </div>
                </div>

                <p className="text-slate-800 leading-relaxed font-normal text-sm">{log.description}</p>

                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between text-xs text-slate-500 font-mono">
                  <span>{log.id}</span>
                  <span className="font-sans font-medium text-slate-700">Actor: {log.actor}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
