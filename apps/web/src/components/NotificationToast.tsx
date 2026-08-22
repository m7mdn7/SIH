import React from 'react';
import { ComplaintNotification } from '../services/notificationService';
import { Bell, MapPin, X, ArrowRight, ShieldAlert } from 'lucide-react';

interface NotificationToastProps {
  notification: ComplaintNotification | null;
  onClose: () => void;
  onInspect?: (complaint: ComplaintNotification) => void;
  activePortName: string;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({
  notification,
  onClose,
  onInspect,
  activePortName,
}) => {
  if (!notification) return null;

  return (
    <div className="fixed bottom-5 right-5 z-50 max-w-md w-full bg-slate-900 text-white rounded-xl shadow-2xl border border-blue-500/40 p-4 animate-bounce-short">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500"></span>
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-blue-400">
            LIVE CROSS-PORTAL COMPLAINT ALERT ({activePortName})
          </span>
        </div>
        <button
          onClick={onClose}
          className="text-slate-400 hover:text-white p-1 rounded-md transition-colors"
          title="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      <div className="mt-3">
        <h4 className="font-bold text-sm text-white flex items-center gap-1.5">
          <ShieldAlert className="h-4 w-4 text-amber-400 shrink-0" />
          <span>{notification.title}</span>
        </h4>
        <p className="text-xs text-slate-300 line-clamp-2 mt-1">
          {notification.description}
        </p>

        <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400">
          <span className="flex items-center gap-1">
            <MapPin className="h-3 w-3 text-blue-400" />
            {notification.locationName}
          </span>
          <span className="bg-red-950 text-red-300 border border-red-800 px-2 py-0.5 rounded font-mono uppercase font-bold text-[10px]">
            HIGH PRIORITY
          </span>
        </div>
      </div>

      <div className="mt-3 pt-2 border-t border-slate-800 flex items-center justify-end space-x-2">
        <button
          onClick={onClose}
          className="px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-300 hover:bg-slate-800 transition-colors"
        >
          Dismiss
        </button>
        {onInspect ? (
          <button
            onClick={() => {
              onInspect(notification);
              onClose();
            }}
            className="px-3 py-1.5 rounded-lg text-xs font-bold bg-blue-600 hover:bg-blue-500 text-white flex items-center space-x-1 transition-colors shadow-sm"
          >
            <span>Inspect & Respond</span>
            <ArrowRight className="h-3.5 w-3.5" />
          </button>
        ) : null}
      </div>
    </div>
  );
};
