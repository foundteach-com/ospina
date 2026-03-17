'use client';

import Link from 'next/link';
import { useState } from 'react';

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const navItems = [
    { name: 'Inicio', href: '/' },
    { name: 'Nosotros', href: '/nosotros' },
    { name: 'Productos', href: '/productos' },
    { name: 'Contacto', href: '/contacto' },
  ];

  return (
    <>
      {/* Top Bar */}
      <div className="bg-blue-900 text-white py-2.5 text-sm hidden sm:block border-b border-blue-800">
        <div className="container-custom flex justify-between items-center text-[12px] font-medium tracking-wide">
          <div className="flex items-center gap-6">
            <a 
              href="https://maps.google.com/?q=Cra.+14+%2324A+-+18,+Yopal,+Casanare" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center gap-2 opacity-90 hover:opacity-100 hover:text-blue-300 transition-all group/loc"
            >
              <span className="w-1.5 h-1.5 bg-blue-400 rounded-full animate-pulse group-hover/loc:bg-blue-300"></span>
              Yopal, Casanare
            </a>
            <a 
              href="https://wa.me/573227790154" 
              target="_blank" 
              rel="noopener noreferrer"
              className="opacity-95 hover:opacity-100 transition-all cursor-pointer flex items-center gap-2.5 hover:text-blue-300 group/wa"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-blue-400 group-hover/wa:scale-110 transition-transform"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              Soporte: <span className="text-white font-bold tracking-normal">322 7790154</span>
            </a>
          </div>
          <div className="flex items-center gap-6">
            <div className="hidden lg:flex items-center gap-4">
              <a href="https://www.linkedin.com/company/ospina-comercializadora-y-suministros/" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 hover:text-blue-300 transition-all duration-300 transform hover:scale-110" title="LinkedIn">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z"></path><rect width="4" height="12" x="2" y="9"></rect><circle cx="4" cy="4" r="2"></circle></svg>
              </a>
              <a href="https://www.facebook.com/ospina.comercializadora.y.suministros" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 hover:text-blue-300 transition-all duration-300 transform hover:scale-110" title="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"></path></svg>
              </a>
              <a href="https://www.instagram.com/ospinacs/" target="_blank" rel="noopener noreferrer" className="opacity-80 hover:opacity-100 hover:text-blue-300 transition-all duration-300 transform hover:scale-110" title="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"></rect><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"></line></svg>
              </a>
            </div>
            <div className="h-4 w-px bg-blue-700/50 mx-1 hidden lg:block"></div>
            <div className="flex items-center gap-2 opacity-90">
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-blue-300"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              <span>
                <span className="hidden xl:inline">Lun - Vie:</span> 8am-12pm | 2pm-6pm <span className="mx-1.5 opacity-40">•</span> <span className="hidden xl:inline">Sáb:</span> 8am-12pm
              </span>
            </div>
          </div>
        </div>
      </div>

      <header className="w-full z-50 glass border-b border-gray-100 bg-white/95 transition-all duration-300">
        <div className="container-custom">
          <div className="flex items-center justify-between h-24">
            {/* Logo */}
            <Link href="/" className="flex items-center gap-4 group">
              <div className="relative">
                <div className="w-14 h-14 bg-gradient-to-br from-blue-700 via-blue-800 to-blue-900 rounded-2xl flex items-center justify-center shadow-xl group-hover:shadow-blue-200/50 transition-all duration-500 overflow-hidden">
                  <span className="text-white font-black text-2xl relative z-10">O</span>
                  <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                </div>
                <div className="absolute -bottom-1 -right-1 w-6 h-6 bg-blue-500 rounded-lg border-4 border-white flex items-center justify-center shadow-lg">
                  <div className="w-1 h-1 bg-white rounded-full"></div>
                </div>
              </div>
              <div className="flex flex-col">
                <span className="text-2xl font-black text-gray-900 tracking-tighter leading-none group-hover:text-blue-700 transition-colors">OSPINA</span>
                <span className="text-[10px] font-bold text-blue-600 uppercase tracking-[0.2em] mt-1 ml-0.5">Comercializadora</span>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center gap-10">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  className="text-gray-600 hover:text-blue-700 text-[15px] font-semibold tracking-tight transition-all duration-300 relative group py-2"
                >
                  {item.name}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-blue-700 rounded-full group-hover:w-full transition-all duration-500 ease-out"></span>
                </Link>
              ))}
            </nav>

            {/* Actions */}
            <div className="flex items-center gap-5">
              <div className="hidden sm:flex items-center h-10 w-px bg-gray-200 mx-1"></div>
              
              <div className="hidden md:block">
                <Link
                  href="/contacto"
                  className="px-8 py-3.5 bg-blue-700 text-white text-sm font-bold rounded-2xl hover:bg-blue-800 transition-all duration-500 shadow-[0_10px_20px_-5px_rgba(29,78,216,0.3)] hover:shadow-[0_15px_25px_-5px_rgba(29,78,216,0.4)] hover:-translate-y-0.5"
                >
                  Solicitar Cotización
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className="lg:hidden w-12 h-12 flex items-center justify-center rounded-xl bg-gray-50 text-gray-900 border border-gray-100 hover:bg-blue-50 hover:text-blue-700 transition-all duration-300 active:scale-95"
              >
                <div className="relative w-6 h-6">
                  {isMenuOpen ? (
                    <div className="flex flex-col items-center justify-center h-full">
                      <span className="w-6 h-0.5 bg-current rotate-45 absolute transition-transform"></span>
                      <span className="w-6 h-0.5 bg-current -rotate-45 absolute transition-transform"></span>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full gap-1.5">
                      <span className="w-6 h-0.5 bg-current transition-all"></span>
                      <span className="w-4 h-0.5 bg-current mr-auto transition-all"></span>
                      <span className="w-6 h-0.5 bg-current transition-all"></span>
                    </div>
                  )}
                </div>
              </button>
            </div>
          </div>

          {/* Mobile Menu Overlay */}
          <div className={`lg:hidden transition-all duration-500 ease-in-out overflow-hidden ${isMenuOpen ? 'max-h-[500px] opacity-100 py-6 border-t border-gray-100' : 'max-h-0 opacity-0'}`}>
            <nav className="flex flex-col gap-2">
              {navItems.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-between px-4 py-3 text-gray-700 hover:text-blue-700 hover:bg-blue-50 rounded-xl font-semibold transition-all duration-300"
                >
                  {item.name}
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all"><path d="m9 18 6-6-6-6"/></svg>
                </Link>
              ))}
              <div className="pt-4 mt-2">
                <Link
                  href="/contacto"
                  onClick={() => setIsMenuOpen(false)}
                  className="flex items-center justify-center w-full px-8 py-4 bg-blue-700 text-white font-bold rounded-2xl hover:bg-blue-800 shadow-lg transition-all"
                >
                  Cotizar Ahora
                </Link>
              </div>
            </nav>
          </div>
        </div>
      </header>
    </>
  );
}
