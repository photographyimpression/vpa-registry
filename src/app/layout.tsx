import type { Metadata } from "next";
import { Inter, Playfair_Display, Roboto_Mono } from "next/font/google";
import "./globals.css";
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import CommandPalette from '@/components/CommandPalette';
import CookieBanner from '@/components/CookieBanner';
import SessionProviderWrapper from '@/components/SessionProviderWrapper';

const inter = Inter({ subsets: ['latin'], variable: '--font-sans' });
const playfair = Playfair_Display({
  variable: "--font-serif",
  subsets: ["latin"],
});

const robotoMono = Roboto_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'VPA Central Registry | Verified Product Authenticity',
  description: 'The global standard in product authenticity and cryptographic certificate verification.',
  openGraph: {
    title: 'VPA Central Registry',
    description: 'The global standard in product authenticity.',
    url: 'https://registry.vpa.gov',
    siteName: 'VPA Network',
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'VPA Central Registry',
    description: 'The global standard in product authenticity.',
  },
  robots: {
    index: true,
    follow: true,
  },
  keywords: ['product authenticity', 'cryptographic certificates', 'VPA registry', 'brand protection'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.variable} ${playfair.variable} ${robotoMono.variable}`}>
        <SessionProviderWrapper>
          <Navbar />
          <CommandPalette />
          {children}
          <Footer />
          <CookieBanner />
        </SessionProviderWrapper>
      </body>
    </html>
  );
}
