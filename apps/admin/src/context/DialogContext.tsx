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
          <div 
            className="relative bg-white rounded-[2.5rem] shadow-2xl shadow-black/40 w-[90%] max-w-[380px] overflow-hidden transform transition-all"
            style={{ maxWidth: '380px' }}
          >
            <div className="p-10 pb-6 text-center">
              {/* Icon / Decorator */}
              <div 
                className={`w-16 h-16 rounded-3xl flex items-center justify-center mb-6 mx-auto shrink-0 ${
                  options.type === 'danger' ? 'bg-red-50 text-red-600' :
                  options.type === 'success' ? 'bg-green-50 text-green-600' :
                  options.type === 'warning' ? 'bg-amber-50 text-amber-600' :
                  'bg-blue-50 text-blue-600'
                }`}
                style={{ width: '64px', height: '64px' }}
              >
                {options.type === 'danger' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18"/><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6"/><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2"/></svg>
                )}
                {options.type === 'success' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M20 6 9 17l-5-5"/></svg>
                )}
                {(options.type === 'info' || !options.type) && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                )}
                {options.type === 'warning' && (
                  <svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z"/><path d="M12 9v4"/><path d="M12 17h.01"/></svg>
                )}
              </div>

              <h3 className="text-2xl font-black text-gray-900 mb-3 font-outfit tracking-tight">
                {options.title}
              </h3>
              <p className="text-gray-500 text-sm font-medium leading-relaxed px-2">
                {options.message}
              </p>
            </div>

            <div className="p-8 pt-4 flex flex-col gap-3">
              <button
                onClick={handleConfirm}
                className={`w-full py-4 text-sm font-black text-white rounded-[1.25rem] transition-all shadow-xl active:scale-[0.97] ${
                  options.type === 'danger' ? 'bg-red-600 shadow-red-600/30' :
                  options.type === 'success' ? 'bg-green-600 shadow-green-600/30' :
                  'bg-blue-600 shadow-blue-600/30'
                }`}
                style={{ 
                  backgroundColor: 
                    options.type === 'danger' ? '#c53030' : 
                    options.type === 'success' ? '#2f855a' : 
                    '#2b6cb0',
                  color: 'white'
                }}
              >
                {options.confirmText || 'Aceptar'}
              </button>
              
              {options.cancelText !== '' && (
                <button
                  onClick={handleCancel}
                  className="w-full py-4 text-sm font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-[1.25rem] transition-all"
                >
                  {options.cancelText || 'Cancelar'}
                </button>
              )}
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
