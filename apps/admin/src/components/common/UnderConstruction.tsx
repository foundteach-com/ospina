import React from 'react';

interface UnderConstructionProps {
  title: string;
}

export default function UnderConstruction({ title }: UnderConstructionProps) {
  return (
    <div className="flex flex-col items-center justify-center w-full h-full min-h-[60vh] text-center px-4 animate-in fade-in duration-500">
      <div className="w-24 h-24 bg-blue-50 rounded-3xl flex items-center justify-center text-blue-600 mb-6 shadow-sm border border-blue-100">
        <svg 
          xmlns="http://www.w3.org/2000/svg" 
          width="48" 
          height="48" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="currentColor" 
          strokeWidth="1.5" 
          strokeLinecap="round" 
          strokeLinejoin="round"
        >
          <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
        </svg>
      </div>
      <h1 className="text-3xl font-bold text-gray-900 mb-3 tracking-tight">{title}</h1>
      <p className="text-gray-500 max-w-lg text-lg">
        Estamos construyendo este módulo para integrarlo al nuevo Sistema Integral de Gestión Empresarial (SIGE). Pronto estará disponible.
      </p>
    </div>
  );
}
