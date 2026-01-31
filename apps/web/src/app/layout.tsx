import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Ospina Comercializadora y Suministros',
  description: 'Soluciones integrales en comercialización y suministros',
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
