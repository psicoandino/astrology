import type { Metadata, Viewport } from "next";
import Script from "next/script";
import ThemeInit from "@/components/ThemeInit";
import "./globals.css";

export const metadata: Metadata = {
  title: "True Spaces · Transits",
  description:
    "Real geocentric planetary positions · IAU zodiac boundaries · Astronomy Engine",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f3ec" },
    { media: "(prefers-color-scheme: dark)", color: "#0f0f10" },
  ],
};

const themeScript = `
(function(){
  try {
    var t = localStorage.getItem('true-spaces-theme');
    var dark = t === 'dark' || (!t && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
  } catch (e) {}
})();
`;

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <head>
        <Script id="theme-init" strategy="beforeInteractive">
          {themeScript}
        </Script>
      </head>
      <body>
        <ThemeInit />
        {children}
      </body>
    </html>
  );
}
