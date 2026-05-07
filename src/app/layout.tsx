import type { Metadata } from 'next';
import { Press_Start_2P } from 'next/font/google';
import './globals.css';

const pressStart2P = Press_Start_2P({ 
  weight: '400',
  subsets: ['latin'],
  variable: '--font-press-start',
});

export const metadata: Metadata = {
  title: 'PetVerse - AI Multiplayer MMO',
  description: 'A 2D pixel-art virtual pet MMO powered by Gemini and Supabase.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${pressStart2P.variable}`}>
      <body className="font-pixel antialiased bg-gray-950 text-white min-h-screen">
        <main className="max-w-6xl mx-auto p-4 md:p-8 h-full">
          {children}
        </main>
      </body>
    </html>
  );
}
