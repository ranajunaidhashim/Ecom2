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
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://www.wigz.store/'),
  title: {
    default: "WigZ | Premium Digital Agency & Store",
    template: "%s | WigZ",
  },
  description: "WigZ: Curated premium essentials, cosmetics, and lifestyle products with fast, trackable shipping. Experience digital excellence.",
  keywords: ["ecommerce", "digital agency", "premium products", "cosmetics", "WigZ", "fast shipping"],
  authors: [{ name: "WigZ Team" }],
  creator: "WigZ",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "/",
    title: "WigZ | Premium Digital Agency & Store",
    description: "Curated premium essentials and lifestyle products.",
    siteName: "WigZ",
  },
  twitter: {
    card: "summary_large_image",
    title: "WigZ | Premium Agency",
    description: "Curated premium essentials and lifestyle products.",
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
