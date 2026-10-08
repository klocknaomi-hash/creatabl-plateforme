import type { Metadata } from "next";
import { Inter, Outfit, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { UrlCleaner } from "@/components/url-cleaner";
import "./globals.css";
import "./creatabl-ds.css";

// Design system Creatabl.ia : Inter pour le texte, Outfit pour les titres
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL('https://app.creatabl-ia.com'),
  
  title: {
    default: 'Creatabl.ia — Dashboard',
    template: '%s | Creatabl.ia',
  },
  
  description: 'Créez, planifiez et analysez tous vos réseaux sociaux sur une seule interface.',
  
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: 'any' },
      { url: '/favicon-32x32.png', type: 'image/png', sizes: '32x32' },
      { url: '/favicon-16x16.png', type: 'image/png', sizes: '16x16' },
    ],
    apple: [
      { url: '/apple-touch-icon.png', sizes: '180x180' },
    ],
    shortcut: '/favicon.ico',
  },
  
  openGraph: {
    title: 'Creatabl.ia — Dashboard',
    description: 'Créez, planifiez et analysez tous vos réseaux sociaux.',
    url: 'https://app.creatabl-ia.com',
    siteName: 'Creatabl.ia',
    images: [
      {
        url: '/logo.png',
        width: 800,
        height: 600,
        alt: 'Creatabl.ia logo',
      },
    ],
    locale: 'fr_FR',
    type: 'website',
  },
  
  twitter: {
    card: 'summary',
    title: 'Creatabl.ia',
    description: 'Créez, planifiez et analysez tous vos réseaux sociaux.',
    images: ['/logo.png'],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <ClerkProvider localization={frFR}>
      <html
        lang="fr"
        suppressHydrationWarning
        className={`${inter.variable} ${outfit.variable} ${playfair.variable} h-full antialiased`}
      >
        <head>
          <link rel="icon" href="/favicon.ico" sizes="any" />
          <link rel="icon" href="/favicon-32x32.png" type="image/png" sizes="32x32" />
          <link rel="icon" href="/favicon-16x16.png" type="image/png" sizes="16x16" />
          <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        </head>
        <body className="min-h-full flex flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            forcedTheme="light"
            enableSystem={false}
            disableTransitionOnChange
          >
            <UrlCleaner />
            {children}
            <Toaster />
          </ThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}