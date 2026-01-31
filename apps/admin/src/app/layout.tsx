import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Admin - Ospina Comercializadora',
  description: 'Plataforma administrativa interna',
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
