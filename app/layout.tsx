import type { Metadata } from "next";
import localFont from "next/font/local";
import { AnalyticsTracker } from "@/components/analytics/AnalyticsTracker";
import { CartProvider } from "@/components/cart/CartDrawer";
import { SearchProvider } from "@/components/search/SearchDialog";
import { ThemeProvider } from "@/components/theme/ThemeProvider";
import "./globals.css";

const avenir = localFont({
  src: [
    {
      path: "../fonts/Avenir Regular/Avenir Regular.ttf",
      weight: "400",
      style: "normal"
    },
    {
      path: "../fonts/Avenir Book/Avenir Book.ttf",
      weight: "500",
      style: "normal"
    },
    {
      path: "../fonts/Avenir Heavy/Avenir Heavy.ttf",
      weight: "700",
      style: "normal"
    },
    {
      path: "../fonts/Avenir Black/Avenir Black.ttf",
      weight: "900",
      style: "normal"
    }
  ],
  variable: "--font-avenir",
  display: "swap"
});

const siteDescription = "Compelling physical items in all shapes and sizes, made by a growing collective of creators.";
const previewImage = {
  url: "/assets/preview_img.jpeg",
  width: 1080,
  height: 1350,
  alt: "ITEMS preview image"
};

export const metadata: Metadata = {
  title: {
    default: "ITEMS",
    template: "%s | ITEMS"
  },
  description: siteDescription,
  metadataBase: new URL("https://itemsyouwant.com"),
  openGraph: {
    title: "ITEMS",
    description: siteDescription,
    url: "/",
    siteName: "ITEMS",
    images: [previewImage],
    type: "website"
  },
  twitter: {
    card: "summary_large_image",
    title: "ITEMS",
    description: siteDescription,
    images: [previewImage]
  },
  icons: {
    icon: [
      {
        url: "/assets/favicon.svg",
        type: "image/svg+xml"
      }
    ],
    shortcut: "/assets/favicon.svg"
  }
};

export default function RootLayout({
  children
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                var storedTheme = window.localStorage.getItem("items-theme");
                var theme = storedTheme === "dark" || storedTheme === "light"
                  ? storedTheme
                  : (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light");
                document.documentElement.dataset.theme = theme;
                document.documentElement.style.colorScheme = theme;
              } catch (_) {}
            `
          }}
        />
      </head>
      <body className={avenir.variable}>
        <ThemeProvider><CartProvider><SearchProvider><AnalyticsTracker />{children}</SearchProvider></CartProvider></ThemeProvider>
      </body>
    </html>
  );
}
