import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

export const metadata: Metadata = {
  title: "CREADIF AI — Plateforme de prospection B2B",
  description:
    "Automatisez la génération de leads, le scoring et l'outreach B2B avec une plateforme IA complète.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr" className={`${inter.variable} h-full antialiased`}>
      <body className="min-h-full bg-gradient-to-b from-blue-50 via-white to-sky-50 font-sans text-slate-900">
        {children}
      </body>
    </html>
  );
}
