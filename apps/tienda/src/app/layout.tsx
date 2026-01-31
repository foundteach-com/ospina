import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Tienda Virtual - Ospina Comercializadora',
  description: 'Catálogo de productos y servicios',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}
