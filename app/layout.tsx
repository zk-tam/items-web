import type { Metadata } from "next";
import localFont from "next/font/local";
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

export const metadata: Metadata = {
  title: {
    default: "ITEMS",
    template: "%s | ITEMS"
  },
  description: "Ideas you want, plus some. A raw artist-led catalog for collectible physical ITEMS.",
  metadataBase: new URL("https://itemsyouwant.com"),
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
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
