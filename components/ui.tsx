import React, { ReactNode } from 'react';
import type { ToastMessage } from '../types';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger';
}

export const Button: React.FC<ButtonProps> = ({ children, className, variant = 'primary', ...props }) => {
  const baseClasses = "px-4 py-2 rounded-lg font-semibold focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 inline-flex items-center gap-2 shadow-sm hover:shadow-md transform hover:-translate-y-0.5 disabled:hover:shadow-sm disabled:hover:-translate-y-0";
  const variantClasses = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 focus:ring-indigo-500 dark:focus:ring-offset-slate-900',
    secondary: 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600 focus:ring-slate-500 dark:focus:ring-offset-slate-900',
    danger: 'bg-red-600 text-white hover:bg-red-700 focus:ring-red-500 dark:focus:ring-offset-slate-900',
  };
  return (
    <button className={`${baseClasses} ${variantClasses[variant]} ${className}`} {...props}>
      {children}
    </button>
  );
};

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 z-50 flex justify-center items-center p-4" onClick={onClose}>
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="p-5 border-b border-slate-200 dark:border-slate-700 flex justify-between items-center">
          <h2 className="text-xl font-bold">{title}</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 text-2xl font-light">&times;</button>
        </div>
        <div className="p-6 overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg' }> = ({ size = 'md' }) => {
    const sizeClasses = {
        sm: 'w-4 h-4',
        md: 'w-8 h-8',
        lg: 'w-12 h-12',
    };
    return (
        <div className={`animate-spin rounded-full border-4 border-slate-300 border-t-indigo-600 dark:border-slate-600 dark:border-t-indigo-500 ${sizeClasses[size]}`}></div>
    );
};

export const RichText: React.FC<{ text: string; className?: string }> = ({ text, className = '' }) => {
  const urlRegex = /(https?:\/\/[^\s]+)/g;

  return (
    <div className={`whitespace-pre-wrap break-words ${className}`}>
      {text.split(urlRegex).map((part, i) => {
        if (part.match(urlRegex)) {
          return (
            <a
              key={i}
              href={part}
              target="_blank"
              rel="noopener noreferrer"
              className="text-blue-600 dark:text-blue-400 underline hover:text-blue-800 dark:hover:text-blue-300 break-all"
              onClick={(e) => e.stopPropagation()}
            >
              {part}
            </a>
          );
        }
        return <span key={i}>{part}</span>;
      })}
    </div>
  );
};

interface ToastProps {
  toast: ToastMessage;
  onDismiss: (id: number) => void;
}

const Toast: React.FC<ToastProps> = ({ toast, onDismiss }) => {
  React.useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast, onDismiss]);

  const colors = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
  };

  return (
    <div className={`w-full max-w-sm rounded-lg shadow-2xl text-white ${colors[toast.type]} p-4 flex justify-between items-center animate-fade-in-up`}>
      <p className="font-medium">{toast.message}</p>
      <button onClick={() => onDismiss(toast.id)} className="ml-4 opacity-70 hover:opacity-100 text-xl font-bold">&times;</button>
    </div>
  );
};

interface ToastContainerProps {
  toasts: ToastMessage[];
  onDismiss: (id: number) => void;
}
export const ToastContainer: React.FC<ToastContainerProps> = ({ toasts, onDismiss }) => (
  <div className="fixed bottom-5 right-5 z-50 space-y-3">
    {toasts.map(toast => (
      <Toast key={toast.id} toast={toast} onDismiss={onDismiss} />
    ))}
  </div>
);