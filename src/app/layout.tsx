import type { Metadata } from "next";
import { Inter, Outfit, JetBrains_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

const mono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

const serif = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: "CreatorOS - YouTube Channel Operating System",
  description: "Manage the entire content lifecycle from idea to published video.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${inter.variable} ${outfit.variable} ${mono.variable} ${serif.variable} antialiased text-foreground selection:bg-indigo-500/25 selection:text-indigo-200 min-h-screen overflow-hidden`}>
        {children}
      </body>
    </html>
  );
}
