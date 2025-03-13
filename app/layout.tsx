import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Footer from "@/components/Footer";
import Header from "@/components/Header";
import { CartProvider } from "@/context/CartContext";
import { ThemeProvider } from "@/components/theme-provider";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Mbaka Textile - Votre boutique de tissus premium en ligne",
    template: "%s | Mbaka Textile",
  },
  description:
    "Découvrez notre large sélection de tissus haut de gamme : bazin, soie, coton, wax et plus. Commandez en ligne et profitez de la livraison rapide !",
  keywords: [
    "tissus en ligne",
    "bazin riche",
    "soie naturelle",
    "wax africain",
    "coton premium",
    "vente de tissus",
    "soie",
    "soie bazin",
    "satin",
    "tissus de qualité",
    "tissus africains",
    "tissus pour couture",
  ],
  openGraph: {
    title: "Mbaka Textile - Votre boutique de tissus premium en ligne",
    description:
      "Découvrez notre large sélection de tissus haut de gamme. Commandez en ligne et profitez de la livraison rapide !",
    url: "https://best-textile.vercel.app/",
    siteName: "Mbaka Textile",
    images: [
      {
        url: "https://best-textile.vercel.app/web-app-manifest-512x512.png",
        width: 1200,
        height: 630,
        alt: "Mbaka Textile - Sélection de tissus",
      },
    ],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Mbaka Textile - Votre boutique de tissus premium en ligne",
    description:
      "Découvrez notre large sélection de tissus haut de gamme. Commandez en ligne et profitez de la livraison rapide !",
    images: ["https://best-textile.vercel.app/twitter-image.jpg"],
  },
  alternates: {
    canonical: "https://best-textile.vercel.app",
    languages: {
      "fr-FR": "https://best-textile.vercel.app/fr",
      "en-US": "https://best-textile.vercel.app/en",
    },
  },
  robots: {
    index: true,
    follow: true,
    nocache: false,
    googleBot: {
      index: true,
      follow: true,
      noimageindex: false,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    google: "your-google-verification-code",
    yandex: "your-yandex-verification-code",
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/web-app-manifest-512x512.png",
    apple: "/web-app-manifest-512x512.png",
  },
  manifest: "https://https://best-textile.vercel.app/site.webmanifest",
  themeColor: "#ffffff",
  authors: [
    {
      name: "Mbaka Textile",
      url: "hhttps://best-textile.vercel.app",
    },
  ],
  metadataBase: new URL("https://best-textile.vercel.app"),
};

const jsonLd = {
  "@context": "https://schema.org",
  "@type": "Store",
  name: "Mbaka Textile",
  image: "https://best-textile.vercel.app/logo.jpg",
  description: "Boutique en ligne de tissus premium",
  url: "https://best-textile.vercel.app",
  telephone: "+242064767604",
  address: {
    "@type": "PostalAddress",
    streetAddress: "35rue mkbakas croisement mariam nguabi",
    addressLocality: "Brazaville",
    postalCode: "242",
    addressCountry: "CG",
  },
  openingHoursSpecification: {
    "@type": "OpeningHoursSpecification",
    dayOfWeek: [
      "Monday",
      "Tuesday",
      "Wednesday",
      "Thursday",
      "Friday",
      "Saturday",
    ],
    opens: "08:00",
    closes: "18:00",
  },
};

// Dans votre layout
<script
  type="application/ld+json"
  dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
/>;

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <Header />
          <main className="min-h-screen bg-background text-foreground">
            {" "}
            <CartProvider>{children}</CartProvider>
          </main>
          <Footer />
        </ThemeProvider>
      </body>
    </html>
  );
}
