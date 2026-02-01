import type { Metadata } from "next";
import { Inter } from "next/font/google"; // Keep Inter as base for now, can switch if user prefers
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SolarSuraksha | Admin Portal", // Updated Name
  description: "Government portal for SolarSuraksha beneficiary fraud detection and analysis", // Updated Name
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
