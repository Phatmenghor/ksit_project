import type React from "react";
import type { Metadata } from "next";
import { Inter, Noto_Sans_TC, Noto_Sans_Khmer } from "next/font/google";
import "./globals.css";
import { Toaster } from "sonner";

// Font definitions
const inter = Inter({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-inter",
});

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans-tc",
});

const notoSansKhmer = Noto_Sans_Khmer({
  subsets: ["khmer"],
  weight: ["400", "500", "700"],
  display: "swap",
  variable: "--font-noto-sans-khmer",
});

export const metadata: Metadata = {
  title: "Institute Management System",
  description: "Dashboard for managing institute resources and data",
  generator: "v0.dev",
};

export const dynamic = "force-dynamic";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
      </head>
      <body
        className={`${inter.variable} ${notoSansKhmer.variable} ${notoSansTC.variable} antialiased h-full overflow-hidden`}
      >
        {children}
        <Toaster />
      </body>
    </html>
  );
}
