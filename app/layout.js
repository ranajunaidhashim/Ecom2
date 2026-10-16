import { Inter } from "next/font/google";
import "./globals.css";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { CartProvider } from "@/components/CartContext";
import ThemeProvider from "@/components/ThemeProvider";
import CartDrawer from "@/components/CartDrawer";
import QuickViewModal from "@/components/QuickViewModal";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const viewport = {
  themeColor: '#ffffff',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
};

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://vellouracollective.shop/'),
  title: {
    default: "Velloura Collective | Luxury Fashion, Wigs, Swimwear & Fine Jewelry",
    template: "%s | Velloura Collective",
  },
  description: "Discover Velloura Collective: Curated luxury women's fashion, human hair wigs, chic swimwear, earrings, rings, cosmetics & beauty essentials with fast, trackable worldwide shipping.",
  keywords: [
    "Velloura Collective",
    "women fashion",
    "luxury human hair wigs",
    "swimwear",
    "bikini",
    "ear rings",
    "rings",
    "jewelry",
    "cosmetics",
    "beauty",
    "luxury boutique",
    "fast shipping"
  ],
  authors: [{ name: "Velloura Collective" }],
  creator: "Velloura Collective",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "Velloura Collective | Luxury Fashion, Wigs, Swimwear & Fine Jewelry",
    description: "Curated luxury women's fashion, virgin human hair wigs, designer swimwear, and fine jewelry. Elevate your everyday elegance.",
    siteName: "Velloura Collective",
  },
  twitter: {
    card: "summary_large_image",
    title: "Velloura Collective | Luxury Fashion, Wigs & Jewelry",
    description: "Curated luxury women's fashion, virgin human hair wigs, designer swimwear, and fine jewelry. Elevate your everyday elegance.",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" suppressHydrationWarning data-scroll-behavior="smooth">
      <body className={`${inter.variable} font-sans flex flex-col min-h-screen antialiased bg-background text-foreground transition-colors duration-300`}>
        <ThemeProvider attribute="class" defaultTheme="dark" enableSystem={false}>
          <CartProvider>
            <Navbar />
            <main className="flex-grow">
              {children}
            </main>
            <Footer />
            <CartDrawer />
            <QuickViewModal />
          </CartProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
