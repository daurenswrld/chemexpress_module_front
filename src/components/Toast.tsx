import React from 'react';
import { useStore } from '../store/useStore';
import { X } from 'lucide-react';

export const ToastContainer: React.FC = () => {
  const { toasts, removeToast } = useStore();

  if (!toasts || toasts.length === 0) return null;

  return (
    <div 
      className="fixed bottom-5 right-5 z-[9999] flex flex-col-reverse gap-2.5 items-end pointer-events-none select-none max-w-[calc(100vw-2.5rem)]"
      aria-live="polite"
    >
      {toasts.map(toast => {
        const isError = toast.type === 'error';

        return (
          <div
            key={toast.id}
            className={`pointer-events-auto flex items-center gap-3 px-4 py-3 rounded-xl border text-xs shadow-xl shadow-slate-900/10 animate-in fade-in slide-in-from-bottom-2 duration-200 max-w-lg transition-colors ${
              isError 
                ? 'bg-rose-50 border-rose-200 text-rose-900' 
                : 'bg-white border-slate-200 text-slate-800'
            }`}
          >
            {/* Message Content with Inline Action Link */}
            <div className="flex items-center flex-wrap gap-x-1.5 gap-y-1 min-w-0 pr-1 leading-normal">
              <span className={`font-semibold whitespace-nowrap ${isError ? 'text-rose-950' : 'text-slate-900'}`}>
                {toast.title}
              </span>
              {toast.message && (
                <>
                  <span className={isError ? 'text-rose-300' : 'text-slate-300'}>•</span>
                  <span className={isError ? 'text-rose-800' : 'text-slate-600'}>
                    {toast.message}
                  </span>
                </>
              )}
              {toast.actionLabel && toast.onAction && (
                <button
                  type="button"
                  onClick={toast.onAction}
                  className={`font-semibold underline underline-offset-2 transition-colors cursor-pointer ml-0.5 ${
                    isError 
                      ? 'text-rose-700 hover:text-rose-900' 
                      : 'text-[#103178] hover:text-blue-700'
                  }`}
                >
                  {toast.actionLabel}
                </button>
              )}
            </div>

            {/* Dismiss Button */}
            <button
              onClick={() => removeToast(toast.id)}
              className={`p-1 rounded-md transition-colors ml-auto shrink-0 cursor-pointer ${
                isError 
                  ? 'text-rose-400 hover:text-rose-600 hover:bg-rose-100' 
                  : 'text-slate-400 hover:text-slate-600 hover:bg-slate-100'
              }`}
              aria-label="Закрыть"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        );
      })}
    </div>
  );
};
