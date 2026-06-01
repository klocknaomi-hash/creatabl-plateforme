import type { Metadata } from "next";
import { Outfit, Playfair_Display } from "next/font/google";
import { ClerkProvider } from "@clerk/nextjs";
import { frFR } from "@clerk/localizations";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";
import { UrlCleaner } from "@/components/url-cleaner";
import "./globals.css";

const outfit = Outfit({ subsets: ["latin"] });

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
        className={`${outfit.className} ${playfair.variable} h-full antialiased`}
      >
        <body className="min-h-full flex flex-col">
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
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