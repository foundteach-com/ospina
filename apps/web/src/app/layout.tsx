import type { Metadata } from 'next';
import './globals.css';
import Header from '@/components/Header';
import Footer from '@/components/Footer';

export const metadata: Metadata = {
  title: 'OSPINA Comercializadora y Suministros | Yopal, Casanare',
  description: 'Tu proveedor multisolución en Yopal, Casanare. Aseo institucional, seguridad industrial, papelería, tecnología, mobiliario y más. Calidad y servicio para empresas e instituciones.',
  keywords: 'comercializadora, suministros, aseo institucional, seguridad industrial, papelería, tecnología, mobiliario, Yopal, Casanare',
  openGraph: {
    title: 'OSPINA Comercializadora y Suministros',
    description: 'Tu aliado estratégico en abastecimiento integral para empresas e instituciones',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className="antialiased">
        <Header />
        <main className="pt-20">{children}</main>
        <Footer />
      </body>
    </html>
  );
}
