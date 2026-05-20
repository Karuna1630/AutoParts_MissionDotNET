import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import { FiCheckCircle, FiAlertCircle, FiInfo, FiX } from 'react-icons/fi';

const ToastContext = createContext(null);

const DEFAULT_TOAST_DURATION = 3000;

export const ToastProvider = ({ children }) => {
  const [toast, setToast] = useState(null);
  const [confirmState, setConfirmState] = useState(null);
  const toastTimerRef = useRef(null);
  const confirmResolverRef = useRef(null);

  const clearToastTimer = useCallback(() => {
    if (toastTimerRef.current) {
      clearTimeout(toastTimerRef.current);
      toastTimerRef.current = null;
    }
  }, []);

  useEffect(() => {
    return () => {
      clearToastTimer();
      if (confirmResolverRef.current) {
        confirmResolverRef.current(false);
        confirmResolverRef.current = null;
      }
    };
  }, [clearToastTimer]);

  const showToast = useCallback((message, options = {}) => {
    const nextToast = typeof message === 'string'
      ? { message, type: options.type || 'info' }
      : {
          type: message?.type || options.type || 'info',
          message: message?.message || options.message || '',
        };

    clearToastTimer();
    setToast({
      type: nextToast.type,
      message: nextToast.message,
    });

    const duration = options.duration ?? message?.duration ?? DEFAULT_TOAST_DURATION;
    if (duration !== null) {
      toastTimerRef.current = setTimeout(() => {
        setToast(null);
        toastTimerRef.current = null;
      }, duration);
    }
  }, [clearToastTimer]);

  const hideToast = useCallback(() => {
    clearToastTimer();
    setToast(null);
  }, [clearToastTimer]);

  const confirm = useCallback((options) => new Promise((resolve) => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(false);
    }

    confirmResolverRef.current = resolve;
    setConfirmState({
      title: options?.title || 'Confirm action',
      message: options?.message || 'Are you sure?',
      confirmText: options?.confirmText || 'Confirm',
      cancelText: options?.cancelText || 'Cancel',
      confirmTone: options?.confirmTone || 'danger',
    });
  }), []);

  const closeConfirm = useCallback((result) => {
    if (confirmResolverRef.current) {
      confirmResolverRef.current(result);
      confirmResolverRef.current = null;
    }
    setConfirmState(null);
  }, []);

  const value = useMemo(() => ({
    toast,
    showToast,
    hideToast,
    confirm,
  }), [toast, showToast, hideToast, confirm]);

  return (
    <ToastContext.Provider value={value}>
      {children}

      {toast && (
        <div className={`fixed top-6 right-6 z-100 w-90 rounded-2xl border p-4 shadow-2xl ${
          toast.type === 'success'
            ? 'border-emerald-100 bg-emerald-50 text-emerald-800'
            : toast.type === 'error'
              ? 'border-rose-100 bg-rose-50 text-rose-800'
              : 'border-sky-100 bg-sky-50 text-sky-800'
        }`}>
          <div className="flex items-start gap-3">
            <div className={`mt-0.5 flex h-8 w-8 items-center justify-center rounded-full text-white ${
              toast.type === 'success'
                ? 'bg-emerald-500'
                : toast.type === 'error'
                  ? 'bg-rose-500'
                  : 'bg-sky-500'
            }`}>
              {toast.type === 'success' ? <FiCheckCircle /> : toast.type === 'error' ? <FiAlertCircle /> : <FiInfo />}
            </div>
            <div className="min-w-0 flex-1">
              <div className="text-sm font-semibold leading-6">{toast.message}</div>
            </div>
            <button
              type="button"
              onClick={hideToast}
              className="rounded-lg p-1 text-current/60 transition hover:bg-black/5 hover:text-current"
              aria-label="Dismiss notification"
            >
              <FiX />
            </button>
          </div>
        </div>
      )}

      {confirmState && (
        <div className="fixed inset-0 z-100 flex items-center justify-center bg-slate-950/45 px-4 py-6">
          <div className="w-full max-w-md rounded-3xl bg-white p-6 shadow-2xl">
            <h2 className="text-xl font-bold text-slate-900">{confirmState.title}</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">{confirmState.message}</p>
            <div className="mt-6 flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={() => closeConfirm(false)}
                className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-semibold text-slate-600 transition hover:bg-slate-50"
              >
                {confirmState.cancelText}
              </button>
              <button
                type="button"
                onClick={() => closeConfirm(true)}
                className={`rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition ${
                  confirmState.confirmTone === 'danger' ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-900 hover:bg-slate-800'
                }`}
              >
                {confirmState.confirmText}
              </button>
            </div>
          </div>
        </div>
      )}
    </ToastContext.Provider>
  );
};

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToast must be used within a ToastProvider.');
  }

  return context;
};
