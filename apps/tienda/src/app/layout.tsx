import type { Metadata } from 'next';
import { QuotationProvider } from './context/QuotationContext';
import Header from './components/Header';
import Footer from './components/Footer';
import QuotationCart from './components/QuotationCart';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tienda Virtual - Ospina Comercializadora',
  description: 'Catálogo de productos y suministros de alta calidad. Solicite su cotización sin compromiso.',
  keywords: 'suministros, comercializadora, productos, cotización, Ospina, Colombia',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="min-h-screen flex flex-col">
        <QuotationProvider>
          <Header />
          <main className="flex-1">
            {children}
          </main>
          <Footer />
          <QuotationCart />
        </QuotationProvider>
      </body>
    </html>
  );
}
