import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/contexts/theme-context";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Beaver Keyboard",
  description: "Digital synthesizer free. Let's create some cool vibes ;)",
  icons: {
    icon: "data:image/svg+xml,<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 100 100'><text y='.9em' font-size='90'>🎹</text></svg>",
  },
  openGraph: {
    title: "Beaver Keyboard",
    description: "Digital synthesizer free. Let's create some cool vibes ;)",
    images: [
      {
        url: "/beaver-keyboard-thumbnail.jpeg",
        width: 1200,
        height: 630,
        alt: "Beaver Keyboard - Digital Synthesizer",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Beaver Keyboard",
    description: "Digital synthesizer free. Let's create some cool vibes ;)",
    images: ["/beaver-keyboard-thumbnail.jpeg"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ThemeProvider>{children}</ThemeProvider>
      </body>
    </html>
  );
}
