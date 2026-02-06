'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DialogOptions {
  title: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  type?: 'danger' | 'info' | 'success' | 'warning';
}

interface DialogContextType {
  confirm: (options: DialogOptions) => Promise<boolean>;
  showAlert: (options: DialogOptions) => Promise<void>;
}

const DialogContext = createContext<DialogContextType | undefined>(undefined);

export function DialogProvider({ children }: { children: ReactNode }) {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<DialogOptions & { resolve: (val: boolean) => void } | null>(null);

  const confirm = (opts: DialogOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setOptions({ ...opts, resolve });
      setIsOpen(true);
    });
  };

  const showAlert = (opts: DialogOptions): Promise<void> => {
    return new Promise((resolve) => {
      setOptions({ ...opts, cancelText: '', resolve: () => resolve() });
      setIsOpen(true);
    });
  };

  const handleConfirm = () => {
    setIsOpen(false);
    options?.resolve(true);
  };

  const handleCancel = () => {
    setIsOpen(false);
    options?.resolve(false);
  };

  return (
    <DialogContext.Provider value={{ confirm, showAlert }}>
      {children}
      
      {/* Modal Overlay */}
      {isOpen && options && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 sm:p-6">
          {/* Backdrop with blur */}
          <div 
            className="absolute inset-0 bg-gray-900/60 backdrop-blur-md transition-opacity duration-300"
            onClick={handleCancel}
          />
          
          {/* Modal Content */}
          <div className="relative bg-white rounded-[2rem] shadow-2xl shadow-black/20 w-full max-w-[440px] overflow-hidden transform transition-all scale-100 opacity-100">
            <div className="p-8 sm:p-10">
              {/* Icon / Decorator */}
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-6 mx-auto ${
                options.type === 'danger' ? 'bg-red-50 text-red-600' :
                options.type === 'success' ? 'bg-green-50 text-green-600' :
                options.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                'bg-blue-50 text-blue-600'
              }`}>
                {options.type === 'danger' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                )}
                {options.type === 'success' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                )}
                {(options.type === 'info' || !options.type) && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                )}
                {options.type === 'warning' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                )}
              </div>

              <h3 className="text-2xl font-bold text-gray-900 text-center mb-3 font-outfit">
                {options.title}
              </h3>
              <p className="text-gray-500 text-center text-base leading-relaxed">
                {options.message}
              </p>
            </div>

            <div className="p-6 bg-gray-50/80 border-t border-gray-100 flex gap-3">
              {options.cancelText !== '' && (
                <button
                  onClick={handleCancel}
                  className="flex-1 px-6 py-3.5 text-sm font-bold text-gray-700 hover:bg-gray-200/50 hover:text-gray-900 rounded-2xl transition-all border border-gray-200"
                >
                  {options.cancelText || 'Cancelar'}
                </button>
              )}
              <button
                onClick={handleConfirm}
                className={`flex-1 px-6 py-3.5 text-sm font-bold text-white rounded-2xl transition-all shadow-md active:scale-[0.98] ${
                  options.type === 'danger' ? 'bg-red-600 hover:bg-red-700' :
                  options.type === 'success' ? 'bg-green-600 hover:bg-green-700' :
                  options.type === 'warning' ? 'bg-amber-600 hover:bg-amber-700' :
                  'bg-blue-600 hover:bg-blue-700'
                }`}
                style={{ backgroundColor: 
                  options.type === 'danger' ? '#dc2626' : 
                  options.type === 'success' ? '#16a34a' : 
                  options.type === 'warning' ? '#d97706' : 
                  '#2563eb' 
                }}
              >
                {options.confirmText || 'Aceptar'}
              </button>
            </div>
          </div>
        </div>
      )}
    </DialogContext.Provider>
  );
}

export function useDialog() {
  const context = useContext(DialogContext);
  if (!context) {
    throw new Error('useDialog must be used within a DialogProvider');
  }
  return context;
}
