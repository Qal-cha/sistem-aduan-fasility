import type { Metadata } from 'next';
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google';
import './globals.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-jakarta',
  display: 'swap',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500', '600'],
  variable: '--font-jetbrains-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  title: 'Facility Damage Helpdesk | Sistem Aduan Kerosakan Fasiliti',
  description:
    'Sistem Aduan Kerosakan Fasiliti — Campus and building facility damage reporting and maintenance helpdesk dashboard.',
  openGraph: {
    title: 'Facility Damage Helpdesk | Sistem Aduan Kerosakan Fasiliti',
    description:
      'Sistem Aduan Kerosakan Fasiliti — Campus and building facility damage reporting and maintenance helpdesk dashboard.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Facility Damage Helpdesk | Sistem Aduan Kerosakan Fasiliti',
    description:
      'Sistem Aduan Kerosakan Fasiliti — Campus and building facility damage reporting and maintenance helpdesk dashboard.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="ms"
      className={`${plusJakartaSans.variable} ${jetbrainsMono.variable}`}
    >
      <body className="min-h-screen bg-slate-50 text-slate-900 antialiased" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
