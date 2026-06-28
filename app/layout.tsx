import type { Metadata, Viewport } from 'next';
import './globals.css';
import GlobalAudio from '@/components/audio/GlobalAudio';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  title: 'THE DEATH OF BROWSING',
  description: 'One record. One riddle. Every dawn.',
  metadataBase: new URL('https://thedeathofbrowsing.com'),
  manifest: '/manifest.json',
  icons: {
    icon: '/assets/sheep-head-removebg-preview.png',
    apple: '/assets/sheep-head-removebg-preview.png',
  },
  appleWebApp: {
    capable: true,
    statusBarStyle: 'black-translucent',
    title: 'TDOB',
  },
  openGraph: {
    title: 'THE DEATH OF BROWSING',
    description: 'One record. One riddle. Every dawn.',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#050505',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <main className="min-h-dvh flex flex-col">
          {children}
        </main>
        <GlobalAudio />
        <Analytics />
      </body>
    </html>
  );
}
