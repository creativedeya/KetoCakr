import type { Metadata } from 'next';
import { Cormorant_Garamond, Manrope } from 'next/font/google';
import './globals.css';

const cormorant = Cormorant_Garamond({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700'],
  style: ['normal', 'italic'],
  variable: '--font-cormorant',
  display: 'swap',
});

const manrope = Manrope({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800'],
  variable: '--font-manrope',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'KetoCake Lab — The Keto Dessert Constructor',
  description: 'Build custom keto cakes with exact macros in seconds. 625+ sugar-free dessert combinations. Join the waitlist.',
  keywords: 'keto recipes, sugar-free desserts, macro calculator baking, keto cake, low carb dessert',
  openGraph: {
    title: 'KetoCake Lab — The Keto Dessert Constructor',
    description: '625+ keto dessert combinations. One modular system.',
    url: 'https://ketocakelab.com',
    siteName: 'KetoCake Lab',
    type: 'website',
  },
  twitter: { card: 'summary_large_image' },
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${cormorant.variable} ${manrope.variable}`}>
      <body>{children}</body>
    </html>
  );
}
