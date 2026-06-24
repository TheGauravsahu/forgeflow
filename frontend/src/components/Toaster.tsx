import { useToastStore } from '../store/useToastStore';
import { X, CheckCircle, AlertCircle, Info } from 'lucide-react';

export function Toaster() {
  const { toasts, removeToast } = useToastStore();

  return (
    <div className="fixed bottom-4 right-4 z-[9999] flex flex-col gap-2 max-w-sm w-full pointer-events-none p-4">
      {toasts.map((toast) => {
        let bgColor = 'bg-zinc-900 border-zinc-800 text-zinc-100';
        let iconColor = 'text-blue-400';
        let Icon = Info;

        if (toast.type === 'success') {
          bgColor = 'bg-zinc-900 border-emerald-500/30 text-zinc-100 shadow-emerald-500/5';
          iconColor = 'text-emerald-400';
          Icon = CheckCircle;
        } else if (toast.type === 'error') {
          bgColor = 'bg-zinc-900 border-rose-500/30 text-zinc-100 shadow-rose-500/5';
          iconColor = 'text-rose-400';
          Icon = AlertCircle;
        }

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-start gap-3 p-4 rounded-lg border shadow-lg backdrop-blur-md transition-all duration-300 animate-in fade-in slide-in-from-bottom-5 ${bgColor}`}
            style={{
              boxShadow: '0 10px 30px -10px rgba(0, 0, 0, 0.5)'
            }}
          >
            <Icon className={`w-5 h-5 mt-0.5 shrink-0 ${iconColor}`} />
            <div className="flex-grow">
              {toast.title && <h4 className="font-semibold text-sm leading-tight">{toast.title}</h4>}
              <p className="text-xs text-zinc-400 mt-1 leading-relaxed">{toast.message}</p>
            </div>
            <button
              onClick={() => removeToast(toast.id)}
              className="text-zinc-500 hover:text-zinc-300 transition-colors mt-0.5 shrink-0"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        );
      })}
    </div>
  );
}
