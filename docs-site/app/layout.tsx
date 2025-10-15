import '@/app/global.css';
import { RootProvider } from 'fumadocs-ui/provider/next';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import type { ReactNode } from 'react';

const inter = Inter({
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'dhan-ts - TypeScript Client for Dhan API v2',
    template: '%s | dhan-ts',
  },
  description: 'A comprehensive, fully-typed TypeScript/JavaScript library for Dhan\'s trading API. Build powerful trading applications with type-safe access to 15+ API modules and real-time WebSocket feeds.',
  icons: {
    icon: '/icon.svg',
    apple: '/icon.svg',
  },
  metadataBase: new URL('https://dhan-ts.dev'),
  openGraph: {
    title: 'dhan-ts - TypeScript Client for Dhan API v2',
    description: 'A comprehensive, fully-typed TypeScript/JavaScript library for Dhan\'s trading API',
    type: 'website',
  },
};

export default function Layout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={inter.className} suppressHydrationWarning>
      <body className="flex flex-col min-h-screen">
        <RootProvider>{children}</RootProvider>
      </body>
    </html>
  );
}
