import type { Metadata } from 'next';
import Script from 'next/script';
import './globals.css';
import { AuthProvider } from '@/context/AuthContext';
import Navbar from '@/components/layout/Navbar';
import Footer from '@/components/layout/Footer';
import SplashScreen from '@/components/layout/SplashScreen';
import { themeInitScript } from '@/lib/theme';

// Fail open: if anything throws the splash simply never shows.
const splashScript = `try{document.documentElement.setAttribute('data-nova-splash','1')}catch(e){}`;

export const metadata: Metadata = {
  title: {
    default: 'Nova Suites - Luxury Hotel & Suites',
    template: '%s | Nova Suites',
  },
  description:
    'Experience warm luxury at Nova Suites. Premium rooms, world-class dining, and exceptional service await you.',
  keywords: ['luxury hotel', 'Nova Suites', 'hotel booking', 'premium suites'],
  openGraph: {
    title: 'Nova Suites - Luxury Hotel & Suites',
    description: 'Experience warm luxury at Nova Suites.',
    type: 'website',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" data-scroll-behavior="smooth" suppressHydrationWarning>
      <body className="antialiased">
        <Script id="nova-theme" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: themeInitScript }} />
        <Script id="nova-splash" strategy="beforeInteractive" dangerouslySetInnerHTML={{ __html: splashScript }} />
        <SplashScreen />
        <AuthProvider>
          <Navbar />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
