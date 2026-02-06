import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Admin - Ospina Comercializadora',
  description: 'Plataforma administrativa interna',
};

import { DialogProvider } from '@/context/DialogContext';

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>
        <DialogProvider>
          {children}
        </DialogProvider>
      </body>
    </html>
  );
}
