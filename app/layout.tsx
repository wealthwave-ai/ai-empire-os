import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Empire OS — Rekha Verma Anka | Chaldean Numerology",
  description:
    "Unlock your destiny with Chaldean Numerology by Rekha Verma Anka. Get your personalized numerology report and discover your life path, name number, and hidden potential. ₹999 only.",
  keywords:
    "chaldean numerology, hindi numerology, rekha verma anka, numerology report, life path number, name numerology, ankashastra",
  authors: [{ name: "Rekha Verma Anka" }],
  openGraph: {
    title: "Empire OS — Rekha Verma Anka | Chaldean Numerology",
    description:
      "Get your personalized Chaldean numerology report and unlock the secrets of your name and birth date.",
    type: "website",
    locale: "hi_IN",
  },
};

export const viewport: Viewport = {
  themeColor: "#07070a",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="hi" className="scroll-smooth">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Cinzel:wght@400;500;600;700;800;900&family=Inter:wght@300;400;500;600;700&family=Noto+Sans+Devanagari:wght@300;400;500;600;700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body
        className="min-h-screen antialiased"
        style={{ backgroundColor: "#07070a", color: "#f0f0f0" }}
      >
        {children}
      </body>
    </html>
  );
}
