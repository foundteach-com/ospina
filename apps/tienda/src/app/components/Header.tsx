'use client';

import Link from 'next/link';
import { useQuotation } from '../context/QuotationContext';
import { useState } from 'react';

export default function Header() {
  const { items, toggleCart } = useQuotation();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <header className="sticky top-0 z-50 bg-white/80 backdrop-blur-xl border-b border-gray-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-20">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-blue-700 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:shadow-xl group-hover:shadow-blue-500/30 transition-all">
              <span className="text-white font-bold text-lg">O</span>
            </div>
            <div className="hidden sm:block">
              <p className="font-bold text-gray-900 leading-none">Ospina</p>
              <p className="text-xs text-gray-500">Comercializadora</p>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-1">
            <Link
              href="/"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              Catálogo
            </Link>
            <Link
              href="/nosotros"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              Nosotros
            </Link>
            <Link
              href="/contacto"
              className="px-4 py-2 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
            >
              Contacto
            </Link>
          </nav>

          {/* Actions */}
          <div className="flex items-center gap-3">
            {/* Quotation Cart Button */}
            <button
              onClick={toggleCart}
              className="relative p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all group"
              aria-label="Ver cotización"
            >
              <svg
                className="w-5 h-5 text-gray-600 group-hover:text-gray-900 transition-colors"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01"
                />
              </svg>
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-xs font-bold rounded-full flex items-center justify-center shadow-lg animate-pulse">
                  {totalItems}
                </span>
              )}
            </button>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-3 bg-gray-50 hover:bg-gray-100 rounded-xl transition-all"
              aria-label="Menú"
            >
              <svg
                className="w-5 h-5 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                {mobileMenuOpen ? (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M6 18L18 6M6 6l12 12"
                  />
                ) : (
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1.5}
                    d="M4 6h16M4 12h16M4 18h16"
                  />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="md:hidden py-4 border-t border-gray-100 animate-fadeIn">
            <nav className="flex flex-col gap-1">
              <Link
                href="/"
                className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Catálogo
              </Link>
              <Link
                href="/nosotros"
                className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Nosotros
              </Link>
              <Link
                href="/contacto"
                className="px-4 py-3 text-sm font-medium text-gray-600 hover:text-gray-900 hover:bg-gray-50 rounded-lg transition-all"
                onClick={() => setMobileMenuOpen(false)}
              >
                Contacto
              </Link>
            </nav>
          </div>
        )}
      </div>
    </header>
  );
}
