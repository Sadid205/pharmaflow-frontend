import type { Metadata } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import './globals.css';
import ReduxProvider from '@/redux/ReduxProvider';
import { LanguageProvider } from '@/context/LanguageContext';
import { ThemeProvider } from '@/context/ThemeContext';
import { Toaster } from 'sonner';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-sans',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'PharmaFlow — Modern Pharmacy Inventory & Store Management',
  description:
    'PharmaFlow is the enterprise-grade inventory management, smart analytics, and POS solution for pharmacies.',
  icons: {
    icon: '/favicon.ico',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={plusJakartaSans.variable} suppressHydrationWarning>
      <body
        className="min-h-screen bg-slate-50 dark:bg-[#090d16] text-slate-900 dark:text-slate-100 antialiased selection:bg-teal-500 selection:text-white transition-colors duration-200"
        suppressHydrationWarning
      >
        <ReduxProvider>
          <ThemeProvider>
            <LanguageProvider>
              {children}
              <Toaster
                position="top-right"
                richColors
                closeButton
                toastOptions={{
                  duration: 4000,
                  className: 'glass-card border border-slate-200 dark:border-slate-800 shadow-xl font-sans text-sm dark:bg-slate-900/90 dark:text-slate-100',
                }}
              />
            </LanguageProvider>
          </ThemeProvider>
        </ReduxProvider>
      </body>
    </html>
  );
}
